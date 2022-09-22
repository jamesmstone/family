#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

npm ()
{
    docker run -it --rm -e CI=true -u "$(id -u):$(id -g)" -v /etc/localtime:/etc/localtime:ro -v $(pwd):/app -w /app node:alpine npm "$@"
}


yarn install;
yarn run clean;
mkdir public
yarn run build;
cp CNAME public/;