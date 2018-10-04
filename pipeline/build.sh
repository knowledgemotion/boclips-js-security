#!/usr/bin/env bash

set -x -e

app=source
(
cd ${app}
npm i
npm run test
npm run build
npm version "$(< version/boclips-js-security)"
)

cp -R ${app}/dist/ ${app}/package.json ${app}/README.md  ${app}/.npmignore dist/
