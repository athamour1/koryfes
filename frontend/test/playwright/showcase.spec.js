import { test, expect } from '@playwright/test';
import { authFile, LOCATION } from './users';
import { navTo } from './helpers';

// A walk through the main pages per role. Run with `npm run test:pw:showcase`
// to get a video of each tour in the HTML report.

test.describe('tour: super admin', () => {
  test.use({ storageState: authFile('superAdmin') });

  test('dashboard, units, users and local groups', async ({ page }) => {
    await page.goto('/admin/dashboard');
    for (const item of ['nav-admin-units', 'nav-admin-users', 'nav-admin-locations', 'nav-catalog', 'nav-profile']) {
      await navTo(page, item);
      await expect(page.locator('.q-page')).toBeVisible();
    }
  });
});

test.describe('tour: local group page', () => {
  test.use({ storageState: authFile('superAdmin') });

  test('leaving it shows the next page', async ({ page }) => {
    await page.goto('/admin/dashboard');
    const id = await page.evaluate(async (name) => {
      const res = await fetch('/api/locations', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      return (await res.json()).find((l) => l.name === name).id;
    }, LOCATION);

    await page.goto(`/locations/${id}`);
    await expect(page.getByText(LOCATION).first()).toBeVisible();
    await navTo(page, 'nav-profile');
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.locator('.q-page')).toBeVisible();
  });
});

test.describe('tour: guide', () => {
  test.use({ storageState: authFile('member') });

  test('progress, catalog, community and profile', async ({ page }) => {
    await page.goto('/my-progress');
    for (const item of ['nav-catalog', 'nav-users', 'nav-profile', 'nav-my-progress']) {
      await navTo(page, item);
      await expect(page.locator('.q-page')).toBeVisible();
    }
  });
});
