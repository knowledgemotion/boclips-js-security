#!/usr/bin/env bash

set -x -e

produce_output () {
    mkdir -p source/e2e/result/{screenshots,videos}
    touch source/e2e/result/{screenshots,videos}/tar-avoid-empty-dir
    cd "source/e2e/result" || exit
    tar -cf ../../test-results/results.tar \
        screenshots/* \
        videos/*
}
trap produce_output EXIT

(
cd source
npm audit
npm ci
npm run test
npm run build

./run_e2e

git checkout package-lock.json
npm --no-git-tag-version -f version "$(< ../version/version)"
)

cp -R source/dist/ source/package.json source/README.md source/.npmignore dist/
