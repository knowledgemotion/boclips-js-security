#!/usr/bin/env bash

set -x -e

produce_output () {
    mkdir -p source/e2e/result/{screenshots,videos}
    touch source/e2e/result/{screenshots,videos}/tar-avoid-empty-dir
    cd "source/e2e/result" || exit
    tar -cf ../../../test-results/results.tar \
        screenshots/* \
        videos/*
}
trap produce_output EXIT

(
cd source
npm run audit-ci
npm ci
npm run test
./run_e2e
)
