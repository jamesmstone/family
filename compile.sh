#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

npm ()
{
    docker run -it --rm -e CI=true -v /etc/localtime:/etc/localtime:ro -v $(pwd):/app -w /app node:alpine npm "$@"
}


npm install;
npm run clean;
mkdir public
npm run build;
cp CNAME public/;