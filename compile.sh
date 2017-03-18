#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

npm () 
{
    docker run -it --rm -e CI=true -v /etc/localtime:/etc/localtime:ro -v $(pwd):/app -w /app node:alpine npm "$@"
}


mkdir -p out;

docker build -t parse-gedcom gedcomToJson;
docker run --rm -i  parse-gedcom <familyTree/stoneFamily.ged >out/stoneFamily.json ;

cp CNAME out/;

cd html/
npm install --dev;
npm test;
npm run build;
cp -r ./build/* ../out/;
