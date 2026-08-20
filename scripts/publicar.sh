#!/usr/bin/env bash
# Publica o build atual na branch gh-pages.
#
# Use isto enquanto o deploy pelo GitHub Actions não estiver ativo. Depois de mover
# docs/workflow-pages.yml para .github/workflows/, o push na main já publica sozinho e
# este script deixa de ser necessário.
set -euo pipefail

cd "$(dirname "$0")/.."

npm run typecheck
npm run lint
npm run test
npm run build

TEMPORARIO="$(mktemp -d)"
git worktree add --detach "$TEMPORARIO" >/dev/null
trap 'git worktree remove "$TEMPORARIO" --force >/dev/null 2>&1 || true' EXIT

cd "$TEMPORARIO"
git checkout --orphan gh-pages >/dev/null
git rm -rq --cached . >/dev/null
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -r "$OLDPWD/dist/." .
touch .nojekyll
git add -A
git commit -qm "Publica o build do artefy"
git push -u origin gh-pages --force

echo "Publicado. https://paulhenrique.github.io/artefy/"
