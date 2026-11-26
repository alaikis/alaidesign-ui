import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..', '..');
const dist = path.resolve(__dirname, '..', 'dist');
fs.mkdirSync(dist, { recursive: true });
for (const name of ['tokens.css', 'styles.css']) {
  const from = path.join(root, 'src', name);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, path.join(dist, name));
    console.log('[copy-assets] copied', name);
  }
}
