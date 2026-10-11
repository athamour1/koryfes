import { test, expect } from '@playwright/test';
import { users } from '../users';
import { navTo, toast } from '../helpers';

test.describe('login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('rejects wrong credentials', async ({ page }) => {
    await page.getByTestId('username-input').fill('nobody');
    await page.getByTestId('password-input').fill('wrong');
    await page.getByTestId('login-btn').click();

    await expect(toast(page, 'negative')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  const landing = { superAdmin: /\/admin\/dashboard/, admin: /\/admin\/dashboard/, leader: /\/my-progress/, member: /\/my-progress/ };

  for (const [role, url] of Object.entries(landing)) {
    test(`${role} lands on their home page`, async ({ page }) => {
      await page.getByTestId('username-input').fill(users[role].username);
      await page.getByTestId('password-input').fill(users[role].password);
      await page.getByTestId('login-btn').click();

      await expect(page).toHaveURL(url);
      // the page itself must render, not just the URL change
      await expect(page.locator('.q-page-container .q-page:not(.auth-shell)')).toBeVisible();
    });
  }

  // leader: no spec reuses its saved session, so logging it out is harmless
  test('logout returns to the login page', async ({ page }) => {
    await page.getByTestId('username-input').fill(users.leader.username);
    await page.getByTestId('password-input').fill(users.leader.password);
    await page.getByTestId('login-btn').click();
    await expect(page).toHaveURL(/\/my-progress/);

    await navTo(page, 'nav-logout');
    await expect(page).toHaveURL(/\/login/);
  });
});

test('protected pages redirect to login when signed out', async ({ page }) => {
  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/login/);
});
