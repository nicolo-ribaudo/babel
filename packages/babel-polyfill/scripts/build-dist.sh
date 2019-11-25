#!/bin/sh
set -ex

BROWSERIFY_CMD="../../node_modules/.bin/browserify"
UGLIFY_CMD="../../node_modules/.bin/uglify"

mkdir -p dist

cd ../..

yarn browserify packages/babel-polyfill/lib/index.js \
  --insert-global-vars 'global' \
  --plugin bundle-collapser/plugin \
  --plugin derequire/plugin \
  > packages/babel-polyfill/dist/polyfill.js
yarn uglifyjs packages/babel-polyfill/dist/polyfill.js \
  --compress keep_fnames,keep_fargs \
  --mangle keep_fnames \
  > packages/babel-polyfill/dist/polyfill.min.js
