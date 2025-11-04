const fs = require('fs');
const path = require('path');

async function copy() {
  try {
    const repoRoot = path.resolve(__dirname, '..', '..');
    const clientDist = path.join(repoRoot, 'client', 'dist');
    const serverPublic = path.join(repoRoot, 'server', 'public');

    if (!fs.existsSync(clientDist)) {
      console.error('Client build not found at', clientDist);
      console.error('Run `cd client && npm install && npm run build` first.');
      process.exit(1);
    }

    // ensure server/public exists and is empty
    if (fs.existsSync(serverPublic)) {
      // remove existing files
      fs.rmSync(serverPublic, { recursive: true, force: true });
    }
    fs.mkdirSync(serverPublic, { recursive: true });

    // Node 16.7+ supports fs.cp; fallback to manual copy if not available
    if (fs.cp) {
      fs.cpSync(clientDist, serverPublic, { recursive: true });
    } else {
      // simple recursive copy
      const copyRecursive = (src, dest) => {
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyRecursive(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };
      copyRecursive(clientDist, serverPublic);
    }

    console.log('Copied client build from', clientDist, 'to', serverPublic);
  } catch (err) {
    console.error('Error copying client build:', err);
    process.exit(1);
  }
}

copy();
