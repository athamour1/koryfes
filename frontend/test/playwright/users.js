// Demo data seeded by seed.setup.js into the throwaway e2e database
export const LOCATION = 'Demo Local Group';
export const UNIT = 'Demo Unit';

export const users = {
  superAdmin: { username: 'admin', password: 'admin123' },
  admin: { username: 'demo_admin', password: 'test', role: 'admin' },
  leader: { username: 'demo_leader', password: 'test', role: 'user', unitRole: 'leader' },
  member: { username: 'demo_member', password: 'test', role: 'user', unitRole: 'member' },
};

// Accounts in the dev docker compose stack, created by scripts/populate_demo_data.sh
export const devUsers = {
  superAdmin: { username: 'admin', password: 'admin123' },
  admin: { username: 'admin_1', password: 'test' },
  leader: { username: 'δημήτρης_καραμανλής_1_1_1', password: 'test' },
  member: { username: 'νικόλαος_δημητρίου_1_1_3', password: 'test' },
};

/** Saved login state per role, written by seed.setup.js */
export const authFile = (role) => `test/playwright/.auth/${role}.json`;
