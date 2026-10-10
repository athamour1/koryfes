#!/usr/bin/env bash
set -euo pipefail

# ─── Configuration ──────────────────────────────────────────────────────────────
REPO="athamour1/koryfes"
REGISTRY="ghcr.io"
# Το path στο GHCR είναι πεζό.
IMAGE_PREFIX="${REGISTRY}/athamour1/koryfes"
# Κάθε image χτίζεται με context τον φάκελό του (backend/, frontend/).
# name|context
IMAGES=(
  "backend|backend"
  "frontend|frontend"
)
# npm projects: το `npm version` ενημερώνει package.json ΚΑΙ package-lock.json.
VERSIONED_PACKAGES=(
  backend
  frontend
)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ─── Colors ─────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${CYAN}ℹ ${NC}$1"; }
ok()    { echo -e "${GREEN}✔ ${NC}$1"; }
warn()  { echo -e "${YELLOW}⚠ ${NC}$1"; }
error() { echo -e "${RED}✖ ${NC}$1"; exit 1; }

cd "$ROOT_DIR"

# ─── Pre-flight checks ─────────────────────────────────────────────────────────
command -v gh     >/dev/null || error "gh CLI not found. Install: https://cli.github.com"
command -v docker >/dev/null || error "docker not found."
command -v npm    >/dev/null || error "npm not found."
gh auth status    >/dev/null 2>&1 || error "Not logged in to GitHub CLI. Run: gh auth login"

# ─── Ask for version ───────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}       ⛰️  Korifes Release Script${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""

# Show latest existing tags for context
LATEST_TAGS=$(git tag --sort=-v:refname 2>/dev/null | head -5)
if [ -n "$LATEST_TAGS" ]; then
  info "Latest tags:"
  echo "$LATEST_TAGS" | sed 's/^/   /'
  echo ""
fi

read -rp "$(echo -e "${YELLOW}Enter version to release (e.g. 1.0.0): ${NC}")" VERSION

# Validate semver-ish format
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+.*$ ]]; then
  error "Invalid version format. Use semver (e.g. 1.0.0, 1.2.3-beta.1)"
fi

TAG="v${VERSION}"

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
  error "Tag $TAG already exists! Choose a different version."
fi

# Clean working tree (αλλιώς ο version commit / τα images θα πάρουν άσχετες
# αλλαγές). Τα untracked αρχεία δεν μπαίνουν ούτε στο commit ούτε στα images.
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  error "Working tree is not clean. Commit or stash your changes first."
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" != "master" ]; then
  warn "You are on '${BRANCH}', not 'master'."
fi

# ─── Confirmation ───────────────────────────────────────────────────────────────
echo ""
info "This will:"
echo "   1. Bump version to ${VERSION} & commit"
echo "   2. Build Docker images for backend & frontend"
echo "   3. Push images to ${IMAGE_PREFIX}"
echo "   4. Create Git tag ${TAG}"
echo "   5. Create GitHub release ${TAG}"
echo ""
for entry in "${IMAGES[@]}"; do
  echo -e "   📦 ${IMAGE_PREFIX}/${entry%%|*}:${TAG}"
done
echo ""

read -rp "$(echo -e "${YELLOW}Proceed? (y/N): ${NC}")" CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  warn "Aborted."
  exit 0
fi

echo ""

# ─── Bump version & commit ─────────────────────────────────────────────────────
info "Bumping version to ${VERSION}..."
for pkg in "${VERSIONED_PACKAGES[@]}"; do
  npm version "$VERSION" --prefix "$pkg" --no-git-tag-version --allow-same-version >/dev/null
  ok "${pkg}/package.json → ${VERSION}"
done

for pkg in "${VERSIONED_PACKAGES[@]}"; do
  git add "${pkg}/package.json" "${pkg}/package-lock.json"
done
git commit -m "chore(release): bump version to ${VERSION}"
ok "Version commit created"

# ─── Login to GHCR ─────────────────────────────────────────────────────────────
info "Logging in to ${REGISTRY}..."
gh auth token | docker login "$REGISTRY" -u "$(gh api user -q .login)" --password-stdin
ok "Logged in to ${REGISTRY}"

# ─── Build & push images ───────────────────────────────────────────────────────
# Οι ρυθμίσεις του frontend είναι runtime (config.js από τον entrypoint), οπότε
# τα images είναι ανεξάρτητα περιβάλλοντος — κανένα build-arg εδώ.
for entry in "${IMAGES[@]}"; do
  name="${entry%%|*}"
  context="${entry#*|}"
  image="${IMAGE_PREFIX}/${name}"

  info "Building ${name} image..."
  docker build \
    --label "org.opencontainers.image.source=https://github.com/${REPO}" \
    --label "org.opencontainers.image.version=${VERSION}" \
    -t "${image}:${TAG}" -t "${image}:latest" "$context"
  ok "${name} image built"

  info "Pushing ${name} image..."
  docker push "${image}:${TAG}"
  docker push "${image}:latest"
  ok "${name} image pushed"
done

# ─── Create Git tag & GitHub release ────────────────────────────────────────────
info "Creating Git tag ${TAG}..."
git tag -a "$TAG" -m "Release ${TAG}"
git push origin HEAD
git push origin "$TAG"
ok "Tag ${TAG} pushed"

info "Creating GitHub release..."
gh release create "$TAG" \
  --repo "$REPO" \
  --title "⛰️ Korifes ${TAG}" \
  --generate-notes
ok "GitHub release created"

# ─── Done ───────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 Release ${TAG} complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo "  Images:"
for entry in "${IMAGES[@]}"; do
  echo "    docker pull ${IMAGE_PREFIX}/${entry%%|*}:${TAG}"
done
echo ""
echo "  Deploy:"
echo "    sed -i 's/^TAG=.*/TAG=${TAG}/' .env.production"
echo "    docker compose -f docker-compose.prod.yml --env-file .env.production pull"
echo "    docker compose -f docker-compose.prod.yml --env-file .env.production up -d"
echo ""
echo "  Release:"
echo "    https://github.com/${REPO}/releases/tag/${TAG}"
echo ""
