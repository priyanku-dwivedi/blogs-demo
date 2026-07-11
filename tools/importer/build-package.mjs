/* eslint-disable */
/*
 * Build a FileVault (JCR) content package from migration-work/jcr-content/*.xml
 * for install via AEM Package Manager.
 *
 * Usage:
 *   node tools/importer/build-package.mjs [--root /content/blogs-demo]
 *
 * Output: migration-work/package/blogs-demo-content/  (unzipped package tree)
 *         migration-work/blogs-demo-content.zip        (installable package)
 */
import {
  readFileSync, writeFileSync, mkdirSync, rmSync, existsSync,
} from 'fs';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const repo = '/backups/priyanku-dwivedi/blogs-demo/repo';
const args = process.argv.slice(2);
const rootIdx = args.indexOf('--root');
const CONTENT_ROOT = rootIdx >= 0 ? args[rootIdx + 1] : '/content/blogs-demo';

// JCR source file -> page path relative to CONTENT_ROOT
const PAGES = [
  ['index.xml', 'index'],
  ['magazine.xml', 'magazine'],
  ['nav.xml', 'nav'],
  ['footer.xml', 'footer'],
  ['magazine/poker-world.xml', 'magazine/poker-world'],
  ['magazine/tags/wsop.xml', 'magazine/tags/wsop'],
  ['magazine/author/frederico-pereira.xml', 'magazine/author/frederico-pereira'],
  ['magazine/author/hyacinth-swanson.xml', 'magazine/author/hyacinth-swanson'],
  ['magazine/jason-koon-poker-net-worth.xml', 'magazine/jason-koon-poker-net-worth'],
  ['magazine/chance-kornuth-poker-net-worth.xml', 'magazine/chance-kornuth-poker-net-worth'],
  ['magazine/sam-farha-poker-net-worth.xml', 'magazine/sam-farha-poker-net-worth'],
  ['magazine/bryn-kenney-poker-net-worth.xml', 'magazine/bryn-kenney-poker-net-worth'],
];

// Intermediate structural nodes that are not pages themselves (need to exist as folders)
const INTERMEDIATE_FOLDERS = ['magazine/tags', 'magazine/author'];

const pkgDir = join(repo, 'migration-work/package/blogs-demo-content');
const jcrRoot = join(pkgDir, 'jcr_root');
const srcDir = join(repo, 'migration-work/jcr-content');

// Fresh build
rmSync(join(repo, 'migration-work/package'), { recursive: true, force: true });
mkdirSync(jcrRoot, { recursive: true });

const rootFsPath = join(jcrRoot, CONTENT_ROOT.replace(/^\//, ''));

// 1. Write each page as {path}/.content.xml
for (const [srcRel, pagePath] of PAGES) {
  const xml = readFileSync(join(srcDir, srcRel), 'utf-8');
  const outFile = join(rootFsPath, pagePath, '.content.xml');
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, xml, 'utf-8');
}

// 2. Intermediate folders as sling:Folder (so /magazine/tags, /magazine/author exist)
const folderXml = `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0" xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
    jcr:primaryType="sling:Folder"/>
`;
for (const folder of INTERMEDIATE_FOLDERS) {
  const outFile = join(rootFsPath, folder, '.content.xml');
  if (!existsSync(outFile)) {
    mkdirSync(dirname(outFile), { recursive: true });
    writeFileSync(outFile, folderXml, 'utf-8');
  }
}

// 2b. Root node definition for CONTENT_ROOT itself (needed for single-root filter)
const rootContentXml = join(rootFsPath, '.content.xml');
if (!existsSync(rootContentXml)) {
  mkdirSync(rootFsPath, { recursive: true });
  writeFileSync(rootContentXml, folderXml, 'utf-8');
}

// 3. META-INF/vault/filter.xml — cover each page path explicitly
const metaVault = join(pkgDir, 'META-INF/vault');
mkdirSync(metaVault, { recursive: true });

// Single filter root covering the whole migrated tree — ensures intermediate
// folder nodes (magazine/tags, magazine/author) install with the pages.
const filterXml = `<?xml version="1.0" encoding="UTF-8"?>
<workspaceFilter version="1.0">
  <filter root="${CONTENT_ROOT}"/>
</workspaceFilter>
`;
writeFileSync(join(metaVault, 'filter.xml'), filterXml, 'utf-8');

// 4. properties.xml (required entries for Package Manager)
const now = new Date().toISOString();
const propsXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
  <comment>FileVault Package Definition</comment>
  <entry key="name">blogs-demo-content</entry>
  <entry key="group">888poker-migration</entry>
  <entry key="version">1.0</entry>
  <entry key="packageType">content</entry>
  <entry key="createdBy">excat-migration</entry>
  <entry key="created">${now}</entry>
  <entry key="buildCount">1</entry>
  <entry key="requiresRoot">false</entry>
  <entry key="allowIndexDefinitions">false</entry>
  <entry key="path">/etc/packages/888poker-migration/blogs-demo-content-1.0.zip</entry>
  <entry key="description">888poker Magazine migration: 12 pages/fragments (home, articles, authors, category, tag, nav, footer)</entry>
</properties>
`;
writeFileSync(join(metaVault, 'properties.xml'), propsXml, 'utf-8');

// 5. MANIFEST.MF (standard FileVault manifest; helps Package Manager identify the pkg).
//    NOTE: deliberately NO config.xml and NO settings.xml — both are optional and,
//    when hand-written with the wrong schema, cause "Error while loading package".
const manifest = [
  'Manifest-Version: 1.0',
  'Content-Package-Type: mixed',
  'Content-Package-Id: 888poker-migration:blogs-demo-content:1.0',
  'Content-Package-Roots: ' + CONTENT_ROOT,
  `Content-Package-Description: 888poker Magazine migration content`,
  'Created-By: excat-migration',
  '',
].join('\n');
const metaInf = join(pkgDir, 'META-INF');
writeFileSync(join(metaInf, 'MANIFEST.MF'), manifest, 'utf-8');

console.log(`Content root: ${CONTENT_ROOT}`);
console.log(`Package tree: ${pkgDir}`);
console.log(`Pages: ${PAGES.length}, intermediate folders: ${INTERMEDIATE_FOLDERS.length}`);
console.log('Now zip the tree (META-INF first) into blogs-demo-content.zip.');
