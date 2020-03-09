#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

npm install;
npm run clean;
npm run build;
