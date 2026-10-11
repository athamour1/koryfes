import { test, expect } from '@playwright/test';
import { users, authFile } from '../users';
import { toast } from '../helpers';

test.use({ storageState: authFile('superAdmin') });

test.describe('super admin user management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/users');
  });

  test('lists the seeded users', async ({ page }) => {
    for (const role of ['admin', 'leader', 'member']) {
      await expect(page.locator('tbody').getByText(users[role].username)).toBeVisible();
    }
  });

  test('search narrows the list', async ({ page }) => {
    await page.getByTestId('search-input').fill(users.leader.username);

    await expect(page.locator('tbody').getByText(users.leader.username)).toBeVisible();
    await expect(page.locator('tbody').getByText(users.member.username)).toBeHidden();
  });

  test('creates a user', async ({ page }) => {
    const username = `pw_user_${Date.now()}`;

    await page.getByTestId('create-user-btn').click();
    const dialog = page.getByRole('dialog');
    await dialog.getByTestId('username-input').fill(username);
    await dialog.getByTestId('password-input').fill('test');
    await dialog.getByTestId('save-user-btn').click();

    await expect(toast(page, 'positive')).toBeVisible();
    await page.getByTestId('search-input').fill(username);
    await expect(page.locator('tbody').getByText(username)).toBeVisible();
  });
});

test.describe('access control', () => {
  test.use({ storageState: authFile('member') });

  test('a member cannot open the admin pages', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page).not.toHaveURL(/\/admin/);
  });
});
