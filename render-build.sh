#!/usr/bin/env bash

set -o errexit

npm install

PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

npx puppeteer browsers install chrome

# if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then
# echo "...Copying Puppeteer Cache from Build Cache"
# # Copying from the actual path where Puppeteer stores its Chrome binary
# cp -R /opt/render/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64 $PUPPETEER_CACHE_DIR
# else
# echo "...Storing Puppeteer Cache in Build Cache"
# cp -R $PUPPETEER_CACHE_DIR /opt/render/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64
# fi