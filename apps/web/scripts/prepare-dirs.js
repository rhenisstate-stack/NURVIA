const fs = require('fs');
const path = require('path');

const webRoot = path.resolve(__dirname, '..');
const appDir = path.join(webRoot, 'app');
const nextDir = path.join(webRoot, '.next');
const nextTypesApp = path.join(nextDir, 'types', 'app');
const nextServerApp = path.join(nextDir, 'server', 'app');

function ensureDir(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}

function mirrorDirs(sourceDir, targetRoot) {
  if (!fs.existsSync(sourceDir)) return;
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const srcSub = path.join(sourceDir, entry.name);
      const tgtSub = path.join(targetRoot, entry.name);
      ensureDir(tgtSub);
      mirrorDirs(srcSub, tgtSub);
    }
  }
}

try {
  ensureDir(nextTypesApp);
  ensureDir(nextServerApp);
  mirrorDirs(appDir, nextTypesApp);
  mirrorDirs(appDir, nextServerApp);
} catch (err) {
  // Graceful warning without breaking build
  console.warn('[prepare-dirs] Note during directory preparation:', err.message);
}
