import { chromium } from 'playwright';

const base = 'http://localhost:5199';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 200)));

await page.evaluate(() => localStorage.clear()).catch(() => {});
await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.fill('input[type="email"]', 'iqac@accreditpro.com').catch(() => {});
await page.fill('input[type="password"]', 'admin123').catch(() => {});
await page.click('button[type="submit"]').catch(() => {});
await page.waitForTimeout(2500);

await page.goto(`${base}/app/iqac-dashboard?view=pending-verification`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

// Banner text before
const bannerBefore = await page.locator('text=/approved by the HOD for/').first().textContent().catch(() => 'none');
console.log('banner before:', bannerBefore.trim());

// Real Playwright click on the year trigger inside scope bar
const scope = page.locator('div.flex-wrap').first();
const yearTrigger = scope.locator('button').filter({ hasText: '20' }).first();
await yearTrigger.click();
await page.waitForTimeout(700);
const openOptions = await page.locator('[role="option"]').allTextContents();
console.log('options:', JSON.stringify(openOptions.map((t) => t.trim())));
await page.locator('[role="option"]').filter({ hasText: '2023-24' }).first().click();
await page.waitForTimeout(1500);

const bannerAfter = await page.locator('text=/approved by the HOD for/').first().textContent().catch(() => 'none');
console.log('banner after:', bannerAfter.trim());
console.log('rows after:', await page.locator('tbody tr').count());
console.log('year trigger text now:', (await scope.locator('button').filter({ hasText: '20' }).first().textContent().catch(() => '')).trim());

// Filter summary line in scope bar ("All departments · 2025-26 — 80 documents")
const summary = await page.locator('text=/documents/').first().textContent().catch(() => 'none');
console.log('summary line:', summary.trim().slice(0, 100));

console.log('console errors:', JSON.stringify(consoleErrors.slice(0, 5)));

await browser.close();
process.exit(0);
