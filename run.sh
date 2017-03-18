docker build -t parse-gedcom gedcomToJson/ && docker run --rm -i  parse-gedcom <familyTree/stoneFamily.ged >familyTree/stoneFamily.json
