// Open one logged-in browser window per role, to click around and showcase.
// Ctrl+C (or closing every window) stops it all.
//
//   npm run demo                         throwaway stack (fresh SQLite, small seed)
//   npm run demo:docker                  dev docker compose, filled by populate_demo_data.sh
//   npm run demo -- leader member        pick roles (superAdmin, admin, leader, member)
//   npm run demo:docker -- --keep        leave the containers running afterwards
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium, request, selectors } from '@playwright/test';
import { WEB_URL, backend, frontend } from './stack.js';
import { users, devUsers } from './users.js';
import { seed, loginUi } from './seed.js';

const LABELS = { superAdmin: 'Super Admin', admin: 'Admin', leader: 'Unit Leader', member: 'Guide' };

const args = process.argv.slice(2);
const docker = args.includes('--docker');
const keep = args.includes('--keep');
const picked = args.filter((a) => !a.startsWith('--'));
const roles = picked.length ? picked : ['superAdmin', 'admin', 'member'];
const accounts = docker ? devUsers : users;

for (const role of roles) {
  if (!accounts[role]) {
    console.error(`Unknown role "${role}". Pick from: ${Object.keys(accounts).join(', ')}`);
    process.exit(1);
  }
}

// npm runs this from frontend/
const ROOT = resolve('..');
const COMPOSE_FILE = resolve(ROOT, 'docker-compose.yml');
const DOCKER_WEB_URL = 'http://localhost:8080';
const DOCKER_API_URL = 'http://localhost:3000';

const children = [];
let browser;
let stopping = false;
let composeStarted = false;

function stopStack() {
  // detached: each server runs in its own process group, so this also ends npm's children
  for (const child of children) {
    try { process.kill(-child.pid, 'SIGTERM'); } catch { /* already gone */ }
  }
  if (composeStarted && !keep) {
    composeStarted = false;
    console.log('Stopping docker compose...');
    spawnSync('docker', ['compose', '-f', COMPOSE_FILE, 'stop'], { stdio: 'inherit' });
  }
}
// safety net for any exit path, including crashes
process.on('exit', stopStack);

async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  console.log('\nShutting down...');
  await browser?.close().catch(() => {});
  stopStack();
  process.exit(code);
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());

const isUp = (url) => fetch(url).then(() => true, () => false);

async function waitFor(name, url, seconds = 120) {
  for (let waited = 0; waited < seconds; waited++) {
    if (await isUp(url)) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`${name} did not come up on ${url}`);
}

/** Run a command to completion; rejects on a non-zero exit */
function run(command, cmdArgs, options) {
  return new Promise((done, fail) => {
    const child = spawn(command, cmdArgs, options);
    child.on('error', fail);
    child.on('exit', (code) => (code === 0 ? done() : fail(new Error(`${command} ${cmdArgs.join(' ')} exited with ${code}`))));
  });
}

async function startServer(name, { command, url, env }, quiet) {
  if (await isUp(url)) {
    throw new Error(`${url} is already in use. Is the Playwright suite or another demo running?`);
  }
  const child = spawn(command, {
    shell: true,
    detached: true,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'ignore', quiet ? 'ignore' : 'inherit'],
  });
  children.push(child);
  child.on('exit', (code) => {
    if (!stopping) {
      console.error(`${name} exited (code ${code})`);
      stop(1);
    }
  });
  await waitFor(name, url);
}

/** Throwaway stack: own backend (fresh SQLite) and frontend, seeded through the API */
async function startLocalStack() {
  console.log('Starting backend and frontend...');
  await Promise.all([startServer('backend', backend), startServer('frontend', frontend, true)]);

  console.log('Seeding demo data...');
  const api = await request.newContext({ baseURL: WEB_URL });
  await seed(api);
  await api.dispose();
  return WEB_URL;
}

/** Dev docker compose stack, filled with the demo local groups, units and Guides */
async function startDockerStack() {
  // only stop afterwards what this demo brought up
  composeStarted = !(await isUp(DOCKER_API_URL));

  console.log('Starting docker compose (first build takes a few minutes)...');
  await run('docker', ['compose', '-f', COMPOSE_FILE, 'up', '-d', '--build'], { stdio: 'inherit' });
  await waitFor('backend', DOCKER_API_URL, 300);
  await waitFor('frontend', DOCKER_WEB_URL, 300);

  console.log('Filling demo data (populate_demo_data.sh)...');
  // it writes demo-users-credentials.md into its working directory: keep that out of the repo
  const dataDir = resolve('test/playwright/.data');
  mkdirSync(dataDir, { recursive: true });
  await run('bash', [resolve(ROOT, 'scripts/populate_demo_data.sh')], {
    cwd: dataDir,
    env: { ...process.env, COMPOSE_FILE },
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  console.log(`All demo accounts: ${resolve(dataDir, 'demo-users-credentials.md')}`);
  return DOCKER_WEB_URL;
}

try {
  const baseURL = docker ? await startDockerStack() : await startLocalStack();

  selectors.setTestIdAttribute('data-cy');
  // our own handlers close the browser and stop the stack
  browser = await chromium.launch({ headless: false, handleSIGINT: false, handleSIGTERM: false });

  let open = roles.length;
  await Promise.all(roles.map(async (role) => {
    // viewport: null lets the page follow the window size
    const context = await browser.newContext({ baseURL, viewport: null, locale: 'el-GR' });
    await context.addInitScript((label) => {
      // Corner tag so the audience can tell the windows apart
      addEventListener('DOMContentLoaded', () => {
        const tag = document.createElement('div');
        tag.textContent = label;
        tag.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:99999;padding:4px 10px;'
          + 'border-radius:999px;background:#000c;color:#fff;font:600 12px system-ui;pointer-events:none';
        document.body.appendChild(tag);
      });
    }, LABELS[role]);

    const page = await context.newPage();
    page.on('close', () => { if (--open === 0) stop(); });
    await loginUi(page, accounts[role]);
  }));

  console.log(`\nReady on ${baseURL}. Logged in as: ${roles.map((r) => `${LABELS[r]} (${accounts[r].username})`).join(', ')}`);
  console.log('Click around freely. Press Ctrl+C or close all windows to stop.');
} catch (err) {
  console.error(err.message);
  await stop(1);
}
