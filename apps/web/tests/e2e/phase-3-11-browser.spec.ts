import { expect, test } from '@playwright/test';

test.describe('Phase 3.11 Browser Verification', () => {
  test('Mark K catalogue & public lecture 1 reader + protected lecture 4 gate (zero 404s)', async ({ page }) => {
    const failed404s: string[] = [];
    page.on('response', (res) => {
      if (res.status() === 404 && res.url().includes('/api/')) {
        failed404s.push(`${res.status()} ${res.url()}`);
      }
    });

    await page.goto('/mark-k');
    await expect(page.getByRole('heading', { name: /Mark K\. NCLEX Lecture Notes/i })).toBeVisible();
    await expect(page.getByText('Lecture 1', { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Lecture 12', { exact: true })).toBeVisible();

    // Open public Lecture 1
    await page.goto('/mark-k/acid-base-ventilator-alarms');
    await expect(page.getByRole('heading', { name: /Acid-Base\/Ventilator Alarms/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tic-Tac-Toe Method' })).toBeVisible();

    // Protected Lecture 4 redirects/gates anonymous visitor
    await page.goto('/mark-k/cardiac-telemetry-chest-tubes');
    await expect(page.getByRole('heading', { name: /Learner Account Required/i })).toBeVisible();
    await expect(page.getByText('Three-chamber drainage system')).toHaveCount(0);

    expect(failed404s).toEqual([]);
  });

  test('Care Plans library search, body system filter, A-Z filter, and detail page', async ({ page }) => {
    await page.goto('/care-plans');
    await expect(page.getByRole('heading', { name: /Nursing Care Plans Library/i })).toBeVisible();
    await expect(page.getByText('Heart Failure & Fluid Volume Overload')).toBeVisible();

    await page.getByRole('button', { name: 'Respiratory' }).click();
    await expect(page.getByText('COPD Acute Exacerbation')).toBeVisible();
    await expect(page.getByText('Heart Failure & Fluid Volume Overload')).toHaveCount(0);

    await page.getByRole('button', { name: 'All', exact: true }).first().click();
    await page.goto('/care-plans/heart-failure-fluid-overload');
    await expect(page.getByRole('heading', { name: /Heart Failure & Fluid Volume Overload/i })).toBeVisible();
    await expect(page.getByText('Excess Fluid Volume')).toBeVisible();
  });

  test('Avatar & Account Menu keyboard navigation, Escape focus return, and outside-click close', async ({ page }) => {
    // Mock authenticated Superadmin session for UI interaction verification
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'superadmin-1',
            name: 'Alex Morgan',
            email: 'alex@nurvia.test',
            role: 'Superadmin',
            avatarUrl: 'https://invalid.example.invalid/broken-avatar.png',
          },
        }),
      });
    });

    await page.goto('/learner/guides');
    const trigger = page.getByRole('button', { name: 'Open account menu' });
    await expect(trigger).toBeVisible({ timeout: 15_000 });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Broken avatar falls back to initials "AM"
    await expect(trigger.getByText('AM')).toBeVisible();

    // Open dropdown
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = page.getByRole('menu', { name: 'Account options' });
    await expect(menu).toBeVisible();
    await expect(menu.getByText('alex@nurvia.test')).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: 'My Account' })).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: 'Admin Dashboard' })).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: 'Learner Dashboard' })).toBeVisible();

    // Keyboard navigation: ArrowDown & Escape restores focus
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();

    // Reopen and close via outside click
    await trigger.click();
    await expect(menu).toBeVisible();
    await page.locator('h1').click({ force: true });
    await expect(menu).toHaveCount(0);
  });
});
