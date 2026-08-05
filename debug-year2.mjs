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

// Find the scope bar container: it contains 'Scope:' label. Get its buttons.
const scopeInfo = await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll('*'));
  const label = els.find((el) => el.childNodes.length === 1 && el.textContent?.trim() === 'Scope:');
  if (!label) return { err: 'no Scope label' };
  // climb to the wrapping flex container
  let container = label.parentElement;
  for (let i = 0; i < 4 && container; i++) {
    if (container.className && String(container.className).includes('flex-wrap')) break;
    container = container.parentElement;
  }
  if (!container) return { err: 'no container' };
  return {
    containerClass: String(container.className),
    html: container.outerHTML.slice(0, 1200),
  };
});
console.log('--- scope container ---');
console.log(scopeInfo.containerClass || scopeInfo.err);
console.log(scopeInfo.html || '');

// Rows before
console.log('rows before:', await page.locator('tbody tr').count());

// Click year trigger (2nd button in scope bar: [Scope label][year select][dept select])
const scope = page.locator('div.flex-wrap').first();
console.log('scope div count:', await scope.count());
const yearTrigger = scope.locator('button').filter({ hasText: '20' }).first();
console.log('year trigger in scope:', await yearTrigger.count(), await yearTrigger.textContent());
await yearTrigger.click();
await page.waitForTimeout(700);

const openOptions = await page.locator('[role="option"]').allTextContents();
console.log('options:', JSON.stringify(openOptions.map((t) => t.trim())));

// Click 2023-24 via evaluate to bypass any pointer interception
await page.evaluate(() => {
  const opt = Array.from(document.querySelectorAll('[role="option"]')).find(
    (o) => (o.textContent || '').trim() === '2023-24'
  );
  if (opt) {
    opt.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    opt.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }));
    opt.click();
  }
});
await page.waitForTimeout(1500);

// Read scope bar state again
const scopeInfo2 = await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll('*'));
  const label = els.find((el) => el.childNodes.length === 1 && el.textContent?.trim() === 'Scope:');
  if (!label) return { err: 'no Scope label' };
  let container = label.parentElement;
  for (let i = 0; i < 4 && container; i++) {
    if (container.className && String(container.className).includes('flex-wrap')) break;
    container = container.parentElement;
  }
  if (!container) return { err: 'no container' };
  return { text: (container.textContent || '').trim().slice(0, 200) };
});
console.log('scope after:', JSON.stringify(scopeInfo2));
console.log('rows after:', await page.locator('tbody tr').count());
console.log('first row year cell:', await page.locator('tbody tr').first().textContent().catch(() => ''));

await browser.close();
process.exit(0);
