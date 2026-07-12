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

// 2b. NOTE: Deliberately do NOT ship a .content.xml for CONTENT_ROOT itself.
// The site root (e.g. /content/blogs-888) is an existing cq:Page. Shipping a
// sling:Folder node for it — and covering it with a broad filter root — would
// OVERWRITE the root page with a folder on install. We never touch the root
// node: filter roots below target only the individual pages/folders/assets.

// 2c. DAM assets — bundle downloaded binaries as dam:Asset nodes.
// FileVault represents a dam:Asset as: {asset.jpg}/.content.xml (metadata) +
// {asset.jpg}/_jcr_content/renditions/original.{ext} (the binary).
// Derive the DAM site root from CONTENT_ROOT (e.g. /content/blogs-888 -> /content/dam/blogs-888).
const siteName = CONTENT_ROOT.split('/').filter(Boolean).pop();
const DAM_ROOT = `/content/dam/${siteName}`;
const damStageDir = join(repo, 'migration-work/dam-assets');
let damAssetCount = 0;
if (existsSync(join(damStageDir, 'url-to-dam.json'))) {
  const damMap = JSON.parse(readFileSync(join(damStageDir, 'url-to-dam.json'), 'utf-8'));
  const damPaths = [...new Set(Object.values(damMap))];
  const assetContentXml = (mime) => `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0" xmlns:dam="http://www.day.com/dam/1.0" xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
    jcr:primaryType="dam:Asset">
  <jcr:content jcr:primaryType="dam:AssetContent">
    <metadata jcr:primaryType="nt:unstructured" dc:format="${mime}"
        xmlns:dc="http://purl.org/dc/elements/1.1/"/>
    <renditions jcr:primaryType="nt:folder"/>
  </jcr:content>
</jcr:root>
`;
  for (const damPath of damPaths) {
    // damPath like /content/dam/blogs-888/magazine/koon_main-hp-headline-small.jpg
    const rel = damPath.replace(/^\/content\/dam\/[^/]+\//, ''); // magazine/koon_main...jpg
    const stageFile = join(damStageDir, rel);
    if (!existsSync(stageFile)) { continue; }
    const ext = (rel.split('.').pop() || 'jpg').toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    // asset node dir under jcr_root/content/dam/{site}/{rel}
    const assetDir = join(jcrRoot, DAM_ROOT.replace(/^\//, ''), rel);
    mkdirSync(join(assetDir, '_jcr_content', 'renditions'), { recursive: true });
    writeFileSync(join(assetDir, '.content.xml'), assetContentXml(mime), 'utf-8');
    // binary as original rendition
    const bin = readFileSync(stageFile);
    writeFileSync(join(assetDir, '_jcr_content', 'renditions', `original.${ext}`), bin);
    damAssetCount += 1;
  }
}

// 3. META-INF/vault/filter.xml — cover the content tree + the DAM tree.
const metaVault = join(pkgDir, 'META-INF/vault');
mkdirSync(metaVault, { recursive: true });

// Scope the filter to the individual pages, intermediate folders, and DAM
// assets — NEVER the CONTENT_ROOT node itself. This guarantees the install
// cannot overwrite/replace the existing site root page.
const pageRoots = PAGES.map(([, p]) => `${CONTENT_ROOT}/${p}`);
const folderRoots = INTERMEDIATE_FOLDERS.map((f) => `${CONTENT_ROOT}/${f}`);
// One DAM filter root per site subfolder used (e.g. /content/dam/blogs-888/magazine)
const damSubRoots = [...new Set(
  (existsSync(join(damStageDir, 'url-to-dam.json'))
    ? Object.values(JSON.parse(readFileSync(join(damStageDir, 'url-to-dam.json'), 'utf-8')))
    : []
  ).map((damPath) => damPath.replace(/\/[^/]+$/, '')), // strip filename -> folder
)];
const allRoots = [...pageRoots, ...folderRoots, ...damSubRoots];
const filterXml = `<?xml version="1.0" encoding="UTF-8"?>
<workspaceFilter version="1.0">
${allRoots.map((r) => `  <filter root="${r}"/>`).join('\n')}
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
console.log(`DAM root: ${DAM_ROOT}`);
console.log(`Package tree: ${pkgDir}`);
console.log(`Pages: ${PAGES.length}, intermediate folders: ${INTERMEDIATE_FOLDERS.length}, DAM assets: ${damAssetCount}`);
console.log('Now zip the tree (META-INF first) into blogs-demo-content.zip.');
