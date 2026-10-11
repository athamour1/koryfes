import { LOCATION, UNIT, users } from './users.js';

async function ok(res, what) {
  if (!res.ok()) throw new Error(`${what}: ${res.status()} ${await res.text()}`);
  return res.json();
}

/** Create the demo local group, unit and users through the API */
export async function seed(request) {
  const { access_token } = await ok(await request.post('/api/auth/login', { data: users.superAdmin }), 'log in as super admin');
  const headers = { Authorization: `Bearer ${access_token}` };

  const location = await ok(await request.post('/api/locations', { headers, data: { name: LOCATION } }), 'create location');
  const unit = await ok(
    await request.post('/api/units', { headers, data: { name: UNIT, location: { id: location.id } } }),
    'create unit',
  );

  for (const { username, password, role, unitRole } of [users.admin, users.leader, users.member]) {
    await ok(
      await request.post('/api/users', {
        headers,
        data: { username, password, role, locationName: LOCATION, ...(unitRole && { unitId: unit.id, unitRole }) },
      }),
      `create ${username}`,
    );
  }
}

/** Log in through the login form */
export async function loginUi(page, { username, password }) {
  await page.goto('/login');
  await page.getByTestId('username-input').fill(username);
  await page.getByTestId('password-input').fill(password);
  await page.getByTestId('login-btn').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}
