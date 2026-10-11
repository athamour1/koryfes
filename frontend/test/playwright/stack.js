// The throwaway stack shared by the Playwright suite and the demo: its own
// backend (fresh SQLite) and frontend, away from the dev servers on 3000/5173
export const API_PORT = 3100;
export const WEB_PORT = 5174;
export const DB_FILE = 'test/playwright/.data/e2e.sqlite';
export const WEB_URL = `http://localhost:${WEB_PORT}`;

export const backend = {
  command: `rm -f ${DB_FILE} && mkdir -p test/playwright/.data && npm --prefix ../backend run start`,
  url: `http://localhost:${API_PORT}`,
  env: {
    NODE_ENV: 'development',
    PORT: String(API_PORT),
    DB_TYPE: 'sqlite',
    DB_DATABASE: `${process.cwd()}/${DB_FILE}`,
    JWT_SECRET: 'playwright-secret',
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD: 'admin123',
    THROTTLE_LIMIT: '100000',
    AUTH_THROTTLE_LIMIT: '100000',
  },
};

export const frontend = {
  command: `npx quasar dev --port ${WEB_PORT}`,
  url: WEB_URL,
  env: { API_PROXY_TARGET: `http://localhost:${API_PORT}` },
};
