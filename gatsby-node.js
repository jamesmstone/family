const createLocation = require("./location");
const moment = require("moment");
const parsegedcom = require(`parse-gedcom`);
const path = require(`path`);
const fs = require(`fs`);

async function onCreateNode({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) {
  const { createNode, createParentChildLink } = actions;

  function convertNode(obj, i, parent) {
    const { tag, tree, pointer, data } = obj;
    const id = createNodeId(
      pointer ? pointer : `${parent.id} [${i}] >>> gedcom`
    );

    const findTags = (tag, t = tree) => t.filter((node) => node.tag === tag);
    const findTag = (tag, t = tree) => {
      const [firstTag] = findTags(tag, t);
      return firstTag;
    };
    const findTagData = (tag, t = tree) => {
      if (!hasTag(tag, t)) return undefined;
      const { data } = findTag(tag, t);
      return data;
    };
    const hasTag = (tag, t = tree) => findTags(tag, t).length > 0;

    const findSource = (t = tree) => {
      const source = findTags("SOUR", t).map(({ data, tree }) => {
        const apid = findTagData("_APID", tree);
        return {
          image: `${data}-${apid}.jpg`,
          path: `${data}.jpg`,
          page: findTagData("PAGE", tree),
          _APID: apid,
        };
      });
      return source.length === 0 ? null : source;
    };

    switch (tag) {
      case "SOUR":
        const title = findTagData("TITL");
        const author = findTagData("AUTH");
        const publisher = findTagData("PUBL");

        return {
          title,
          author,
          publisher,
          id,
          parent: null, //parent.id,
          internal: {
            contentDigest: createContentDigest(obj),
            type: "Source",
          },
        };

        break;
      case "INDI":
        let name = findTagData("NAME");
        let nameTags = findTags("NAME");
        let given, surname, nameSource;

        if (nameTags !== undefined) {
          let nameTree = nameTags && nameTags[0] ? nameTags[0].tree : undefined;
          given = findTagData("GIVN", nameTree);
          surname = findTagData("SURN", nameTree);
          nameSource = findSource(nameTree);
        }

        if (
          given === undefined &&
          surname === undefined &&
          name !== undefined
        ) {
          let [g, s] = name.split("/");
          given = g;
          surname = s;
        }

        let death, birth, baptism, residence;
        if (hasTag("DEAT")) {
          let [{ tree: deathTree }] = findTags("DEAT");
          let died =
            (deathTree.length === 0 && findTagData("DEAT") === "Y") || true;
          let place = findTagData("PLAC", deathTree);
          let date = findTagData("DATE", deathTree);
          let deathSource = findSource(deathTree);
          death = {
            died,
            place: place ? { place } : null,
            date: date ? moment(date, "D MMM YYYY").format() : null,
            source: deathSource,
          };
        }
        if (hasTag("BIRT")) {
          let [{ tree: birthTree }] = findTags("BIRT");
          let place = findTagData("PLAC", birthTree);
          let date = findTagData("DATE", birthTree);
          let birthSource = findSource(birthTree);

          birth = {
            born: true,
            place: place ? { place } : null,
            date: date ? moment(date, "D MMM YYYY").toISOString() : null,
            source: birthSource,
          };
        }
        if (hasTag("BAPM")) {
          let [{ tree: baptismTree }] = findTags("BAPM");
          let place = findTagData("PLAC", baptismTree);
          let date = findTagData("DATE", baptismTree);
          let baptismSource = findSource(baptismTree);

          baptism = {
            place: place ? { place } : null,
            date: date ? moment(date, "D MMM YYYY").toISOString() : null,
            source: baptismSource,
          };
        }
        if (hasTag("RESI")) {
          residence = findTags("RESI").map(({ tree: residenceTree }) => {
            let place = findTagData("PLAC", residenceTree);
            let date = findTagData("DATE", residenceTree);
            let source = findSource(residenceTree);
            return {
              place: place ? { place } : null,
              date: date ? moment(date, "D MMM YYYY").toISOString() : null,
              source: source,
            };
          });
        }
        const sex = findTagData("SEX");
        const occupation = findTagData("OCCU");
        const familyChild = findTagData("FAMC");
        const familySpouse = findTags("FAMS").map(({ data }) =>
          createNodeId(data)
        );

        return {
          name: {
            given: given ? given.trim() : undefined,
            surname: surname ? surname.trim() : undefined,
            source: nameSource,
          },
          sex,
          occupation,
          birth,
          baptism,
          residence,
          death,
          familyChild: familyChild ? createNodeId(familyChild) : undefined,
          familySpouse,

          id,
          children: [],
          parent: null, //parent.id,
          internal: {
            contentDigest: createContentDigest(obj),
            type: "Individual",
          },
        };
        break;
      case "FAM":
        const husband = findTagData("HUSB");
        const wife = findTagData("WIFE");
        const children = findTags("CHIL").map(({ data }) => createNodeId(data));
        return {
          husband: husband ? createNodeId(husband) : undefined,
          wife: wife ? createNodeId(wife) : undefined,
          children,

          id,
          parent: null, //parent.id,
          internal: {
            contentDigest: createContentDigest(obj),
            type: "Family",
          },
        };
        break;
    }
    return null;
  }

  if (node.extension !== `ged`) {
    return;
  }
  const content = await loadNodeContent(node);
  const parsedContent = parsegedcom.parse(content);

  parsedContent.forEach((obj, i) => {
    const convertedObj = convertNode(obj, i, node);

    if (convertedObj !== null) {
      createNode(convertedObj);
      createParentChildLink({ parent: node, child: convertedObj });
    }
  });
}

exports.onCreateNode = onCreateNode;

exports.createResolvers = ({
  actions,
  cache,
  createNodeId,
  createResolvers,
  store,
  reporter,
}) => {
  const { createNode } = actions;
  const resolvers = {
    Individual: {
      relationships: {
        type: ["Individual"],
        args: {
          relationship: "String!",
        },
        resolve(a, { relationship }, context, info) {
          const { id, familyChild, familySpouse } = a;
          const getFamC = () =>
            context.nodeModel.getNodeById({ id: familyChild, type: "Family" });
          const getFamSs = () =>
            context.nodeModel.getNodesByIds({
              ids: familySpouse,
              type: "Family",
            });
          const getIndividual = (id) => {
            if (id === null) return null;
            return context.nodeModel.getNodeById({ id, type: "Individual" });
          };

          switch (relationship) {
            case "father":
              const famcA = getFamC();
              return famc !== null && famc.hasOwnProperty("husband")
                ? [getIndividual(famc.husband)]
                : null;
            case "mother":
              const famcB = getFamC();
              return famcB !== null && famcB.hasOwnProperty("wife")
                ? [getIndividual(famcB.wife)]
                : null;
            case "parents":
              const famcC = getFamC();
              if (famcC === null) {
                return [];
              }
              if (
                famcC.hasOwnProperty("husband") &&
                famcC.husband &&
                famcC.hasOwnProperty("wife") &&
                famcC.wife
              ) {
                return [
                  getIndividual(famcC.husband),
                  getIndividual(famcC.wife),
                ];
              }
              if (famcC.hasOwnProperty("husband") && famcC.husband) {
                return [getIndividual(famcC.husband)];
              }
              if (famcC.hasOwnProperty("wife") && famcC.wife) {
                return [getIndividual(famcC.wife)];
              }
              return [];

            case "children":
              return getFamSs().flatMap(({ children }) =>
                children.map((c) => getIndividual(c))
              );
            case "spouse":
              return getFamSs()
                .flatMap(({ husband, wife }) => [
                  getIndividual(husband),
                  getIndividual(wife),
                ]) // this includes the current individual
                .filter((s) => {
                  if (s === null) return false;
                  return s.id !== id;
                }); // so here we exclude them
          }
        },
      },
    },
    Place: {
      location: {
        type: "Location",
        resolve(source, args, context, info) {
          return createLocation({
            location: source.place,
            store,
            cache,
            createNode,
            createNodeId,
            reporter,
          });
        },
      },
    },
  };
  createResolvers(resolvers);
};

exports.createSchemaCustomization = ({ actions, schema }) => {
  const { createTypes, createFieldExtension } = actions;

  createFieldExtension({
    name: "fullName",
    extend(options, prevFieldConfig) {
      return {
        resolve(source) {
          return `${source.given || "(missing)"} ${source.surname || ""}`;
        },
      };
    },
  });
  createFieldExtension({
    name: "allEvent",
    extend(options, prevFieldConfig) {
      return {
        resolve(source) {
          const events = source.event ? source.event : [];
          const birth = source.birth
            ? {
                title: "Birth",
                place: source.birth.place,
                date: source.birth.date,
                source: source.birth.source,
              }
            : null;
          const residence = source.residence
            ? source.residence.map((r) => ({
                title: "Residence",
                place: r.place,
                date: r.date,
                source: r.source,
              }))
            : [];
          const death = source.death
            ? {
                title: "Death",
                place: source.death.place,
                date: source.death.date,
                source: source.death.source,
              }
            : null;
          const baptism = source.baptism
            ? {
                title: "Baptism",
                place: source.baptism.place,
                date: source.baptism.date,
                source: source.baptism.source,
              }
            : null;
          const sortedEvents = [...residence, ...events].sort((a, b) => {
            let x = a ? a : 0;
            let y = b ? b : 0;
            return x - y;
          });
          return [birth, baptism, ...sortedEvents, death].filter((e) => e);
        },
      };
    },
  });
  createFieldExtension({
    name: "age",
    extend(options, prevFieldConfig) {
      return {
        resolve({
          birth: { date: bDate } = { date: undefined },
          death: { date: dDate } = { date: undefined },
        }) {
          if (bDate === undefined) {
            return null;
          }

          if (dDate === undefined) {
            const years = moment().diff(moment(bDate), "years");
            if (isNaN(years)) return null;
            return years;
          }
          const years = moment(dDate).diff(bDate, "years");
          if (isNaN(years)) return null;
          return years;
        },
      };
    },
  });
  createFieldExtension({
    name: "alive",
    extend(options, prevFieldConfig) {
      return {
        resolve({
          birth: { date: bDate } = { date: undefined },
          death: { date: dDate } = { date: undefined },
        }) {
          if (bDate === undefined) {
            return false;
          }

          if (dDate === undefined) {
            return true;
          }
          return false;
        },
      };
    },
  });
  createFieldExtension({
    name: "birthCentury",
    extend(options, prevFieldConfig) {
      return {
        resolve({ birth: { date: bDate } = { date: undefined } }) {
          if (bDate === undefined) {
            return null;
          }
          return moment(bDate).century();
        },
      };
    },
  });

  const typeDefs = [
    `type Individual implements Node @dontInfer {
          name: Name
          sex: String
          occupation: String
          birth: Birth
          death: Death
          baptism: Baptism
          residence: [Residence]
          alive: Boolean @alive
          familyChild: Family @link
          familySpouse: [Family] @link
          age: Int @age
          event: [ Event ]
          allEvent: [Event] @allEvent
      }`,
    `type Family implements Node @dontInfer {
          children: [Individual] @link
          husband: Individual @link
          wife: Individual @link
      }`,
    `type Name @dontInfer {
          fullName: String! @fullName
          given: String
          surname: String
          source: [Source]
      }`,
    `type Birth @dontInfer {
          born:Boolean
          place: Place
          date:Date @dateformat
          source:[Source]
      }`,
    `type Residence @dontInfer {
          place: Place
          date:Date @dateformat
          source:[Source]
      }`,
    `type Baptism @dontInfer {
          place: Place
          date:Date @dateformat
          source:[Source]
      }`,
    `type Death @dontInfer {
          died: Boolean
          place: Place
          date:Date @dateformat
          source:[Source]

      }`,
    `type Event @dontInfer {
          title : String
          place: Place
          date:Date @dateformat
          source:[Source]

      }`,
    schema.buildObjectType({
      name: "Source",
      interfaces: ["Node"],
      extensions: {
        // While in SDL you have two different directives, @infer and @dontInfer to
        // control inference behavior, Gatsby Type Builders take a single `infer`
        // extension which accepts a Boolean
        infer: false,
      },
      fields: {
        title: { type: "String" },
        author: { type: "String" },
        publisher: { type: "String" },
        page: { type: "String" },
        _APID: { type: "String" },
        image: {
          type: "File",
          resolve: (source, args, context, info) =>
            context.nodeModel.getAllNodes({ type: "File" }).find((file) => {
              if (
                file.relativePath === undefined ||
                file.relativePath === null
              ) {
                throw Error("missing file path: " + file.toString());
              }
              if (source.image === undefined || source.image === null) {
                throw Error("missing source image: " + source.toString());
              }
              return file.relativePath === source.image;
            }),
        },
      },
    }),
    `type Place @dontInfer {
          place: String
      }`,
    `type Location @dontInfer {
          lat: String
          lng: String
      }`,
  ];

  createTypes(typeDefs);
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const result = await graphql(`
    query {
      allIndividual {
        nodes {
          id
        }
      }
      allFamily {
        nodes {
          id
        }
      }
    }
  `);
  result.data.allIndividual.nodes.forEach((node) => {
    createPage({
      path: `individual/${node.id}`,
      component: path.resolve(`./src/templates/individual.js`),
      context: {
        // Data passed to context is available
        // in page queries as GraphQL variables.
        id: node.id,
      },
    });
  });
  result.data.allFamily.nodes.forEach((node) => {
    createPage({
      path: `family/${node.id}`,
      component: path.resolve(`./src/templates/family.js`),
      context: {
        // Data passed to context is available
        // in page queries as GraphQL variables.
        id: node.id,
      },
    });
  });
};

const publicPath = `./public`;
exports.onPostBuild = async ({ graphql, reporter }, pluginOptions) => {
  const result = await graphql(`
    query {
      allIndividual {
        nodes {
          id
          birth {
            born
            date(formatString: "DD MMMM YYYY")
            place {
              place
            }
            source {
              ...SourceInfo
            }
          }
          death {
            died
            date(formatString: "DD MMMM YYYY")
            place {
              place
            }
            source {
              ...SourceInfo
            }
          }
        }
      }
    }
  `);

  const outputPath = path.join(publicPath, "individualsAPI.json");
  await fs.writeFile(outputPath, result);
};
