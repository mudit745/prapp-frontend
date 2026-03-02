/**
 * Step 1 from senior's steps: create webapp folder and copy files into it.
 * - Copies dist/* (Vite build output) into webapp/
 * - Copies manifest.json, xs-app.json, xs-security.json from public/ into webapp/
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const distDir = path.join(root, 'dist');
const webappDir = path.join(root, 'webapp');
const publicDir = path.join(root, 'public');

const filesToCopyFromPublic = ['manifest.json', 'xs-app.json', 'xs-security.json'];

if (!fs.existsSync(distDir)) {
  console.error('Run "npm run build" first. dist/ not found.');
  process.exit(1);
}

// Create webapp folder
fs.mkdirSync(webappDir, { recursive: true });

// Copy dist contents into webapp
function copyRecursive(src, dest) {
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}
copyRecursive(distDir, webappDir);

// Copy manifest, xs-app, xs-security from public into webapp
for (const name of filesToCopyFromPublic) {
  const src = path.join(publicDir, name);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(webappDir, name));
  }
}

console.log('webapp/ created and filled with dist + manifest, xs-app.json, xs-security.json');
