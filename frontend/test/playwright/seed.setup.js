import { test as setup } from '@playwright/test';
import { users, authFile } from './users';
import { seed, loginUi } from './seed';

// The logins below need the seeded users
setup.describe.configure({ mode: 'serial' });

setup('seed demo data', async ({ request }) => {
  await seed(request);
});

// Log in through the UI once per role and reuse the session in the specs
for (const role of Object.keys(users)) {
  setup(`log in as ${role}`, async ({ page }) => {
    await loginUi(page, users[role]);
    await page.context().storageState({ path: authFile(role) });
  });
}
