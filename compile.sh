#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

npm ()
{
    docker run -it --rm -e CI=true -v /etc/localtime:/etc/localtime:ro -v $(pwd):/app -w /app node:alpine npm "$@"
}



docker build -t parse-gedcom gedcomToJson;
docker run --rm -i  parse-gedcom <familyTree/stoneFamily.ged >html/public/stoneFamily.json ;

cp CNAME html/public;

cd html/
npm install --dev;
npm test;
npm run build;
