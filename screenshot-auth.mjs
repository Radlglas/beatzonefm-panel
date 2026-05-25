import puppeteer from 'puppeteer';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const base  = process.argv[2] || 'http://localhost:3001';
const route = process.argv[3] || '/dashboard';
const label = process.argv[4] || 'page';

const dir = join(__dirname, 'screenshots');
if (!existsSync(dir)) await mkdir(dir, { recursive: true });

let n = 1;
let filename;
do {
  filename = join(dir, `screenshot-${n}-${label}.png`);
  n++;
} while (existsSync(filename));

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

// Login first
await page.goto(`${base}/login`, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));

await page.type('input[type="email"]', 'marius@radiopendel.de');
await page.type('input[type="password"]', 'admin123');
await page.click('button[type="submit"]');
await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 });
await new Promise(r => setTimeout(r, 800));

// Navigate to target route
if (route !== '/dashboard') {
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle2', timeout: 20000 });
  await new Promise(r => setTimeout(r, 800));
}

await page.screenshot({ path: filename, fullPage: true });
await browser.close();

console.log('Saved:', filename);
