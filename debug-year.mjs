import { chromium } from 'playwright';

const base = 'http://localhost:5199';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

await page.evaluate(() => localStorage.clear()).catch(() => {});
await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.fill('input[type="email"]', 'iqac@accreditpro.com').catch(() => {});
await page.fill('input[type="password"]', 'admin123').catch(() => {});
await page.click('button[type="submit"]').catch(() => {});
await page.waitForTimeout(2500);

await page.goto(`${base}/app/iqac-dashboard?view=pending-verification`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const countRows = async (label) => console.log(`${label}: rows=${await page.locator('tbody tr').count()}`);
await countRows('before');

// Find ALL h-8 buttons with year-like text
const yearBtns = await page.locator('button.h-8').allTextContents();
console.log('h-8 buttons:', JSON.stringify(yearBtns.map((t) => t.trim()).slice(0, 8)));

// Click the scope year trigger via exact structure
const scopeTrigger = page.locator('button.h-8').filter({ hasText: '2025-26' }).first();
console.log('scope trigger count:', await scopeTrigger.count());
await scopeTrigger.click();
await page.waitForTimeout(800);

// Dump all visible option-ish elements
const options = await page.locator('[role="option"]').allTextContents();
console.log('options after click:', JSON.stringify(options.map((t) => t.trim()).slice(0, 10)));

const opt2023 = page.locator('[role="option"]').filter({ hasText: '2023-24' }).first();
console.log('2023-24 option count:', await opt2023.count());
await opt2023.click().catch((e) => console.log('click err:', e.message));
await page.waitForTimeout(1500);

const yearLabel = await scopeTrigger.textContent().catch(() => '');
console.log('scope trigger now shows:', yearLabel.trim());
await countRows('after 2023-24');

await browser.close();
process.exit(0);
