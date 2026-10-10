# Production Deployment Guide

There is no CI/CD in this repo: releases are built and pushed on demand, locally,
with `./release.sh`, and the server only pulls the published images.

## Release

```bash
./release.sh
```

Asks for a version, bumps `backend/` and `frontend/` `package.json` (+ lockfiles),
commits, builds and pushes the `backend` and `frontend` images to
`ghcr.io/athamour1/koryfes/*` (tagged `vX.Y.Z` and `latest`), then pushes a
git tag and creates a GitHub release with generated notes. Needs `docker`,
`npm` and an authenticated `gh` CLI, and a clean working tree.

## Architecture

```
Internet ──443──▶ your reverse proxy (TLS) ──▶ 127.0.0.1:8080 frontend (nginx)
                                                 ├─ /        → PWA static files
                                                 └─ /api/    → backend ─▶ postgres
                                                                  └─▶ garage (S3, images)
```

Only the frontend publishes a port. The backend, Postgres and Garage are reachable only
on the internal Docker network, and the PWA calls the API on the same origin
(`/api`), so no CORS setup is needed.

## Server setup

Only two files go to the server, no clone of the repo is needed:

- `docker-compose.prod.yml`
- `.env.production.example`, copied as `.env.production` and filled in

(Garage's `garage.toml` is written into the `garage_config` volume by the
one-shot `garage-config` service, so it needs no file on the server.)

### Environment (`.env.production`)

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DB_PASSWORD` | yes | — | `openssl rand -hex 24`. Postgres only reads it when the volume is first created; don't change it afterwards. |
| `JWT_SECRET` | yes | — | `openssl rand -base64 48`. The backend refuses to start on a secret shorter than 32 characters, a placeholder or an unexpanded `$(...)`. Rotating it logs everyone out. |
| `GARAGE_RPC_SECRET` | yes | — | `openssl rand -hex 32`. Garage's internal RPC secret. |
| `GARAGE_ADMIN_TOKEN` | yes | — | `openssl rand -base64 32`. Used by `garage-init` to set up the bucket and key. |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | yes | — | The backend's key: `echo GK$(openssl rand -hex 12)` / `openssl rand -hex 32` (Garage's key format). `garage-init` imports it; don't change it afterwards. |
| `S3_BUCKET` | no | `koryfes` | Bucket for uploads. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | no | — | Super admin, created on first boot and its password **reset to this on every boot**. Must be 8+ characters with upper/lowercase and a number, or the backend refuses to start. Leave empty to skip. |
| `TAG` | no | `latest` | Image tag to run. Pin a release (`v1.0.0`) so you know what runs and can roll back. |
| `BIND_ADDR` | no | `127.0.0.1` | Host address the frontend listens on (see *Ports*). |
| `HTTP_PORT` | no | `8080` | Host port of the frontend. |
| `VITE_API_URL` | no | `/api` | Runtime frontend config (written to `config.js` at container start, no rebuild). |
| `VITE_STAGING_MESSAGE` | no | — | Banner on the login page, e.g. for a staging instance. |
| `DB_USERNAME` / `DB_DATABASE` | no | `postgres` / `guide_badges` | |
| `THROTTLE_LIMIT` / `AUTH_THROTTLE_LIMIT` | no | `100` / `10` | Requests per client IP per minute (overall / login & password reset). |

> **Using a UI (Arcane, Portainer, Dockge…) to edit the env?** Never paste
> `$(openssl …)` into it: it is stored as literal text. Run the command in a
> terminal and paste its **output**.

In a shell on the server, this writes a file with random secrets (edit the tag
and admin password):

```bash
cat > .env.production <<EOF
TAG=v1.0.0
DB_PASSWORD=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
GARAGE_RPC_SECRET=$(openssl rand -hex 32)
GARAGE_ADMIN_TOKEN=$(openssl rand -base64 32)
S3_ACCESS_KEY_ID=GK$(openssl rand -hex 12)
S3_SECRET_ACCESS_KEY=$(openssl rand -hex 32)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeMe-Str0ng
EOF
chmod 600 .env.production
```

### First deploy

```bash
alias dc='docker compose -f docker-compose.prod.yml --env-file .env.production'

# GHCR packages are private by default: log in once (a token with read:packages)
docker login ghcr.io

dc pull
dc up -d        # migrations run automatically when the backend starts
dc ps           # db, backend, frontend (healthy) and garage up; garage-config and garage-init exit 0
```

Then sign in with the admin account at `https://<your-domain>/`. There is no
public sign-up; the admin creates everyone else.

### Ports

- **Proxy on the same host, not in Docker**: keep the defaults.
- **Proxy in a Docker container on the same host**: it can't reach the host's
  `127.0.0.1`; set `BIND_ADDR=172.17.0.1` (Docker bridge), or attach the proxy
  to this stack's network and proxy to `frontend:80`.
- **Proxy on another machine**: `BIND_ADDR=0.0.0.0` and allow `HTTP_PORT` only
  from the proxy's IP.

On the host firewall open only 80/443 (plus SSH), never 8080. The proxy must
send `X-Forwarded-For` / `X-Forwarded-Proto` (Caddy does by default; rate
limiting relies on them) and should set HSTS. Minimal Caddyfile:

```
korifes.example.gr {
    reverse_proxy 127.0.0.1:8080
    header Strict-Transport-Security "max-age=31536000; includeSubDomains"
}
```

### Upgrades and rollback

```bash
sed -i 's/^TAG=.*/TAG=v1.0.1/' .env.production
dc pull && dc up -d     # new migrations apply before the backend serves traffic
```

Roll back by setting the previous `TAG` and running the same commands.

#### Upgrading to the first release with Garage (uploads in S3)

This release adds the `garage-config`, `garage` and `garage-init` services, so
`TAG` alone is not enough:

1. Back up the database and the old `./uploads` folder (see *Backups*).
2. Replace `docker-compose.prod.yml` with the one from the release.
3. Add the four new variables to `.env.production` (see the table above):
   `GARAGE_RPC_SECRET`, `GARAGE_ADMIN_TOKEN`, `S3_ACCESS_KEY_ID`,
   `S3_SECRET_ACCESS_KEY`. Compose refuses to start while any is missing.
4. Set the new `TAG` and run `dc pull && dc up -d`.
5. Check that the init ran and the old images were moved:

   ```bash
   dc logs garage-init | tail -1     # garage-init: ready
   dc logs backend | grep -i legacy  # Copied N legacy upload(s) to the bucket
   ```

   (No "Copied" line means `./uploads` was empty.) Open a few units and check
   their flags. Keep `./uploads` until you have; it is only read on startup.

If `garage-init` fails, the backend does not start (it waits for it):
`dc logs garage garage-init` shows why, usually a wrong `GARAGE_ADMIN_TOKEN`
or an S3 key that doesn't match Garage's format (`GK` + 24 hex / 64 hex).
Rolling back to a release before Garage needs the old compose file too.
Migrations are forward-only, so a rollback across a schema change needs a
database restore.

### Backups

State lives in the `postgres_data` volume and in Garage's `garage_meta` and
`garage_data` volumes (uploaded images). Stop Garage briefly for a consistent copy
of its volumes:

```bash
dc exec -T db pg_dump -U postgres guide_badges | gzip > backup-$(date +%F).sql.gz
dc stop garage
# --volumes-from finds Garage's volumes whatever the compose project is called
docker run --rm --volumes-from "$(dc ps -aq garage)" -v "$PWD":/out alpine \
  tar czf /out/garage-$(date +%F).tar.gz /var/lib/garage
dc start garage
```

The old `./uploads` directory is only read on startup: files in it that are
missing from the bucket are copied there. Keep it until you have checked that
every image shows up, then it can go.

### Changing runtime config

Edit `.env.production`, then `dc up -d` (compose recreates only the services whose
config changed). Frontend settings take effect on the next page load: `config.js`,
`index.html` and the service worker are served with `Cache-Control: no-cache`, and
the service worker does not precache `config.js`.

## Migrating from the old Docker Hub images

Earlier deployments ran `thanosmourtk/korifes-*` images with the backend published
on `127.0.0.1:3000` and the frontend on `0.0.0.0:8080`. With the new compose file:

- the backend no longer publishes a port; use `dc exec backend ...` for debugging
- the frontend binds to `127.0.0.1:8080` by default; set `BIND_ADDR` if your proxy
  isn't on the same host
- `ADMIN_PASSWORD` must meet the password policy, or the backend won't start
- `uploads/` and the `postgres_data` volume are unchanged, so data carries over
  (keep the same compose project directory)
