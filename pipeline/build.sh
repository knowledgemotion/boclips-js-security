#!/usr/bin/env bash

set -x -e

app=source
(
cd ${app}
npm audit
npm ci
npm run test
npm run build

./run_e2e

git checkout package-lock.json
npm --no-git-tag-version -f version "$(< ../version/version)"
)

cp -R ${app}/dist/ ${app}/package.json ${app}/README.md  ${app}/.npmignore dist/
