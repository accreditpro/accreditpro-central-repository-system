import { chromium } from 'playwright';

const base = 'http://localhost:5199';
const results = [];
const step = (name, ok, extra = '') =>
  results.push(`${ok ? 'PASS' : 'FAIL'}: ${name}${extra ? ' — ' + extra : ''}`);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push(String(e)));

const login = async (email) => {
  await page.evaluate(() => localStorage.clear()).catch(() => {});
  await page.goto(`${base}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.fill('input[type="email"]', email).catch(() => {});
  await page.fill('input[type="password"]', 'admin123').catch(() => {});
  await page.click('button[type="submit"]').catch(() => {});
  await page.waitForTimeout(2500);
};

try {
  // ---------- 1. IQAC: Repository Verification view ----------
  await login('iqac@accreditpro.com');
  step('iqac login lands in app', page.url().includes('/app'), page.url());

  await page.goto(`${base}/app/iqac-dashboard?view=verification`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  step('verification nav in sidebar', (await page.locator('text=Repository Verification').count()) > 0);
  step('verification view title', (await page.locator('h1:has-text("Repository Verification")').count()) > 0);
  step('hierarchy panel', (await page.locator('text=Institution Hierarchy').count()) > 0);
  step('summary cards render', (await page.locator('text=Ready to Verify').count()) > 0);
  const tableRows = await page.locator('tbody tr').count();
  step('document grid has rows', tableRows > 0, `rows=${tableRows}`);
  step('filter bar has HOD status filter', (await page.locator('text=HOD Approval Status').count()) > 0 || (await page.locator('text=All HOD Status').count()) > 0);

  // ---------- 2. Pending Verification + department/year scoping + verify ----------
  await page.goto(`${base}/app/iqac-dashboard?view=pending-verification`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  step('pending view renders', (await page.locator('h1:has-text("Pending Verification")').count()) > 0);
  step('scope bar year select', (await page.locator('text=Scope:').count()) > 0);

  // Scoping: the pending queue is per department for a particular year.
  // The scope-bar triggers are the h-8 Radix selects (the dashboard header's
  // year picker is h-10 and must NOT be clicked).
  const rowsAll = await page.locator('tbody tr').count();
  step('pending shows all departments for current year', rowsAll > 0, `rows=${rowsAll}`);
  const bannerBefore = await page.locator('text=/approved by the HOD for/').first().textContent().catch(() => 'none');

  // Switch academic year in the scope bar → the pending queue must change.
  // Note: row counts can't be compared directly — each department group renders
  // its own paginated table (10 rows/page × 8 departments = 80 rows always), so
  // the banner count is the reliable signal that the year scope changed.
  await page.locator('button.h-8:has-text("2025-26")').first().click();
  await page.waitForTimeout(600);
  await page.locator('[role="option"]:has-text("2023-24")').first().click();
  await page.waitForTimeout(1200);
  await page.locator('tbody tr').first().waitFor().catch(() => {});
  const rowsYear = await page.locator('tbody tr').count();
  const bannerAfter = await page.locator('text=/approved by the HOD for/').first().textContent().catch(() => 'none');
  step('year filter changes pending queue', (bannerAfter || '').includes('2023-24') && (bannerBefore || '') !== bannerAfter, `banner: ${(bannerBefore || '').trim()} → ${(bannerAfter || '').trim()}`);

  // Switch back to 2025-26.
  await page.locator('button.h-8:has-text("2023-24")').first().click();
  await page.waitForTimeout(600);
  await page.locator('[role="option"]:has-text("2025-26")').first().click();
  await page.waitForTimeout(1000);

  // Narrow to a single department → list must shrink and group to one dept.
  const deptTrigger = page.locator('button.h-8:has-text("All Departments")').first();
  await deptTrigger.click();
  await page.waitForTimeout(600);
  const optionTexts = await page.locator('[role="option"]').allTextContents();
  const firstDept = optionTexts.map((t) => t.trim()).find((t) => t && !t.includes('All Departments'));
  await page.locator(`[role="option"]:has-text("${firstDept}")`).first().click();
  await page.waitForTimeout(1200);
  const rowsDept = await page.locator('tbody tr').count();
  const deptGroups = await page.locator('div.flex.h-6.w-6.items-center.justify-center').count();
  step('department filter narrows pending list', rowsDept < rowsAll, `all=${rowsAll} ${firstDept}=${rowsDept}`);
  step('pending grouped under single dept header', deptGroups === 1, `groups=${deptGroups} dept=${firstDept}`);

  const verifyBtns = page.locator('button:has-text("Verify")');
  const verifyCount = await verifyBtns.count();
  step('verify buttons present', verifyCount > 0, `count=${verifyCount}`);
  if (verifyCount > 0) {
    await verifyBtns.first().click();
    await page.waitForTimeout(1000);
    step('verify dialog opens', (await page.locator('text=Verify Document').first().isVisible().catch(() => false)));
    await page.locator('button:has-text("Verify")').last().click().catch(() => {});
    await page.waitForTimeout(1500);
  }

  // ---------- 3. Verified Documents ----------
  await page.goto(`${base}/app/iqac-dashboard?view=verified-documents`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  step('verified view renders', (await page.locator('h1:has-text("Verified Documents")').count()) > 0);
  const verifiedRows = await page.locator('tbody tr').count();
  step('verified documents listed', verifiedRows > 0, `rows=${verifiedRows}`);

  // ---------- 4. Observations ----------
  await page.goto(`${base}/app/iqac-dashboard?view=verification-observations`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  step('observations view renders', (await page.locator('h1:has-text("Verification Observations")').count()) > 0);
  const obsCards = await page.locator('text=Recommended correction').count();
  step('observation cards with corrections', obsCards > 0, `count=${obsCards}`);

  // ---------- 5. Verification Reports ----------
  await page.goto(`${base}/app/iqac-dashboard?view=verification-reports`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  step('reports view renders', (await page.locator('h1:has-text("Verification Reports")').count()) > 0);
  step('5 report types', (await page.locator('text=Department Verification Report').count()) > 0 && (await page.locator('text=Evidence Verification Summary').count()) > 0);

  // ---------- 6. HOD widget ----------
  await login('hod@accreditpro.com');
  await page.goto(`${base}/app/hod-dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  step('HOD quality observations widget', (await page.locator('text=Department Quality Observations').count()) > 0);

  // ---------- 6b. Department Coordinator widget ----------
  await login('department@accreditpro.com');
  await page.goto(`${base}/app/department-repository`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.locator('aside button:has-text("Dashboard")').first().click().catch(() => {});
  await page.waitForTimeout(1500);
  const deptWidget = await page.locator('text=My Pending IQAC Observations').count();
  step('dept coordinator pending observations widget', deptWidget > 0, `count=${deptWidget}`);

  // ---------- 7. Impersonation read-only (Super Admin) ----------
  await login('superadmin@accreditpro.com');
  await page.waitForTimeout(1000);
  await page.goto(`${base}/admin/institutions`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.locator('svg.lucide-ellipsis, svg.lucide-more-horizontal').first().click();
  await page.waitForTimeout(1000);
  await page.locator('text=Impersonate').first().click().catch(() => {});
  await page.waitForTimeout(1000);
  await page.locator('button:has-text("View as IQAC Coordinator")').first().click().catch(() => {});
  await page.waitForTimeout(2500);
  await page.goto(`${base}/app/iqac-dashboard?view=verification`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const readOnlyVerify = await page.locator('button:has-text("Verify")').count();
  const readOnlyRaise = await page.locator('button:has-text("Raise Observation")').count();
  step('impersonation hides verify/raise (read-only)', readOnlyVerify === 0 && readOnlyRaise === 0, `verify=${readOnlyVerify} raise=${readOnlyRaise}`);
  step('banner visible during preview', (await page.locator('text=Viewing as IQAC Coordinator').count()) > 0);
} catch (e) {
  results.push(`ERROR: ${e.message}`);
}

const realConsoleErrors = consoleErrors.filter((e) => !e.includes('favicon'));
step('no console errors', realConsoleErrors.length === 0, realConsoleErrors.slice(0, 3).join(' | '));

console.log('\n===== VERIFICATION MODULE E2E =====');
console.log(results.join('\n'));
await browser.close();
process.exit(0);
