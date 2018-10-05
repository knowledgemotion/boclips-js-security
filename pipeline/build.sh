#!/usr/bin/env bash

set -x -e

app=source
(
cd ${app}
npm i
npm run test
npm run build
git checkout package-lock.json
npm --no-git-tag-version -f version "$(< ../version/version)"
)

cp -R ${app}/dist/ ${app}/package.json ${app}/README.md  ${app}/.npmignore dist/
