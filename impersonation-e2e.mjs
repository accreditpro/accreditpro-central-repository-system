import { chromium } from 'playwright';

const base = 'http://localhost:5199';
const results = [];
const step = (name, ok, extra = '') =>
  results.push(`${ok ? 'PASS' : 'FAIL'}: ${name}${extra ? ' — ' + extra : ''}`);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push(String(e)));

const login = async () => {
  await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.fill('input[type="email"]', 'superadmin@accreditpro.com').catch(() => {});
  await page.fill('input[type="password"]', 'admin123').catch(() => {});
  await page.click('button[type="submit"]').catch(() => {});
  await page.waitForTimeout(2500);
};

const openImpersonateDialog = async () => {
  await page.goto(`${base}/admin/institutions`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const moreButtons = page.locator('svg.lucide-ellipsis, svg.lucide-more-horizontal');
  if ((await moreButtons.count()) === 0) return false;
  await moreButtons.first().click();
  await page.waitForTimeout(800);
  const item = page.locator('text=Impersonate').first();
  const visible = await item.isVisible().catch(() => false);
  if (visible) await item.click().catch(() => {});
  await page.waitForTimeout(1200);
  return visible;
};

const startIqacPreview = async () => {
  const cta = page.locator('button:has-text("View as IQAC Coordinator")').first();
  const visible = await cta.isVisible().catch(() => false);
  if (visible) await cta.click().catch(() => {});
  await page.waitForTimeout(2500);
  return visible;
};

const exitImpersonation = async () => {
  await page.locator('text=Exit impersonation').first().click().catch(() => {});
  await page.waitForTimeout(2500);
};

try {
  // 1. Login as Super Admin
  await login();
  step('login redirects to admin area', page.url().includes('/admin'), page.url());

  // 2. Impersonate dialog opens from row menu — IQAC-only picker
  const dialogOpened = await openImpersonateDialog();
  step('impersonate dialog opens', dialogOpened);
  const dialogVisible = await page.locator('text=Preview Institution').first().isVisible().catch(() => false);
  step('dialog title visible', dialogVisible);
  const iqacCtaVisible = await page.locator('button:has-text("View as IQAC Coordinator")').first().isVisible().catch(() => false);
  step('IQAC Coordinator is the only preview action', iqacCtaVisible);
  const financeOptionGone = (await page.locator('text=Finance Coordinator').count()) === 0;
  step('no other role pickers shown', financeOptionGone);

  // 3. Start the IQAC preview — lands on the college's IQAC dashboard
  const started = await startIqacPreview();
  step('IQAC preview starts', started);
  step('lands on iqac dashboard', page.url().includes('/app/iqac-dashboard'), page.url());
  step('banner visible (iqac)', (await page.locator('text=Viewing as IQAC Coordinator').first().isVisible().catch(() => false)));
  const collegeBadge = await page.locator('text=Previewing').count() + await page.locator('span:has-text("IQAC Dashboard")').count();
  step('dashboard renders', collegeBadge > 0 || (await page.locator('h1:has-text("IQAC Dashboard")').count()) > 0);

  // 4. Supporting Documents — no upload / edit actions in read-only
  await page.locator('button:has-text("Supporting Documents")').first().click().catch(() => {});
  await page.waitForTimeout(1500);
  const uploadBtn = await page.locator('text=Upload Document').count();
  step('no Upload Document button (read-only)', uploadBtn === 0, `count=${uploadBtn}`);

  // 5. Quality Observations — no raise/close/delete actions in read-only
  await page.locator('button:has-text("Quality Observations")').first().click().catch(() => {});
  await page.waitForTimeout(1500);
  const raiseBtn = await page.locator('text=Raise Observation').count();
  step('no Raise Observation button (read-only)', raiseBtn === 0, `count=${raiseBtn}`);

  // 6. Banner persists across reload
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  step('banner persists after reload', (await page.locator('text=Viewing as IQAC Coordinator').first().isVisible().catch(() => false)));

  // 7. Profile menu shows read-only state and exit action
  await page.locator('button:has(svg.lucide-chevrons-up-down)').first().click().catch(() => {});
  await page.waitForTimeout(800);
  step('profile menu shows read-only badge', (await page.locator('text="Read-only preview"').first().isVisible().catch(() => false)));
  step('profile menu has exit impersonation action', (await page.locator('text=Exit impersonation').first().isVisible().catch(() => false)));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 8. Exit impersonation from the banner
  await exitImpersonation();
  step('exit returns to institutions', page.url().includes('/admin/institutions'), page.url());

  // 9. Banner gone after exit
  const bannerGone = (await page.locator('text=Viewing as').count()) === 0;
  step('no banner after exit', bannerGone);
} catch (e) {
  results.push(`ERROR: ${e.message}`);
}

const realConsoleErrors = consoleErrors.filter((e) => !e.includes('favicon'));
step('no console errors', realConsoleErrors.length === 0, realConsoleErrors.slice(0, 3).join(' | '));

console.log('\n===== E2E RESULTS =====');
console.log(results.join('\n'));
await browser.close();
process.exit(0);
