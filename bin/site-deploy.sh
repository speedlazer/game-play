#!/bin/sh
set -e

# Dry run
TARGET_ENV=site yarn build
rm -r dist

# Clean up for release
git checkout gh-pages
git rm -r assets index.html game.*.js game.*.js.map
git commit -m 'prepare for release'

# Buid project
git checkout -
TARGET_ENV=site yarn build
git checkout -

# Move files to root
cd dist
mv * ..
cd ..
rm -r dist
git add index.html assets game.*.js game.*.js.map
rm *.LICENSE.txt

# publish

git commit --amend

echo 'ready to be pushed / published!'

