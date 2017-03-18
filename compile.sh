#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

mkdir -p out;

docker build -t parse-gedcom gedcomToJson;
docker run --rm -i  parse-gedcom <familyTree/stoneFamily.ged >out/stoneFamily.json ;
cp -r html out;
