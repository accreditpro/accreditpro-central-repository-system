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

// List all buttons containing year-like text
const buttons = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('button').forEach((b, i) => {
    const t = (b.textContent || '').trim();
    if (t) out.push(`${i}: [${t.slice(0, 60)}] class=${b.className.slice(0, 60)}`);
  });
  return out;
});
console.log('--- buttons ---');
console.log(buttons.join('\n'));

// Rows before
console.log('rows before:', await page.locator('tbody tr').count());

// Try clicking the scope-bar year trigger — find button whose text is exactly a year and is near 'Scope:'
const scopeBtn = await page.evaluate(() => {
  const labels = Array.from(document.querySelectorAll('*')).filter(
    (el) => el.childNodes.length === 1 && el.textContent?.trim() === 'Scope:'
  );
  if (!labels.length) return null;
  const scope = labels[0];
  const container = scope.closest('div');
  const btns = container ? Array.from(container.querySelectorAll('button')) : [];
  return btns.map((b, i) => ({ i, text: (b.textContent || '').trim() })).slice(0, 6);
});
console.log('--- scope container buttons ---', JSON.stringify(scopeBtn));

// Click the first year button in the scope container
const clicked = await page.evaluate(() => {
  const labels = Array.from(document.querySelectorAll('*')).filter(
    (el) => el.childNodes.length === 1 && el.textContent?.trim() === 'Scope:'
  );
  if (!labels.length) return 'no scope label';
  const container = labels[0].closest('div');
  const btns = container ? Array.from(container.querySelectorAll('button')) : [];
  const yearBtn = btns.find((b) => /^20\d{2}-/.test((b.textContent || '').trim()));
  if (!yearBtn) return 'no year button in scope';
  yearBtn.click();
  return 'clicked ' + (yearBtn.textContent || '').trim();
});
console.log('--- click result ---', clicked);
await page.waitForTimeout(800);

const options = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('[role="option"]')).map((o) => ({
    text: (o.textContent || '').trim().slice(0, 40),
    aria: o.getAttribute('aria-selected'),
  }));
});
console.log('--- options ---', JSON.stringify(options.slice(0, 12)));

await browser.close();
process.exit(0);
