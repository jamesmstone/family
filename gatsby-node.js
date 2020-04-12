const moment = require("moment");
const parsegedcom = require(`parse-gedcom`);
const path = require(`path`);

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

    const findTags = (tag, t = tree) => t.filter(node => node.tag === tag);
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

        let death, birth, baptism;
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
            date: date ? moment(date).format() : null,
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
            date: date ? moment(date).toISOString() : null,
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
            date: date ? moment(date).toISOString() : null,
            source: baptismSource,
          };
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

exports.createResolvers = ({ createResolvers }) => {
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
          const getIndividual = id => {
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
                children.map(c => getIndividual(c))
              );
            case "spouse":
              return getFamSs()
                .flatMap(({ husband, wife }) => [
                  getIndividual(husband),
                  getIndividual(wife),
                ]) // this includes the current individual
                .filter(s => {
                  if (s === null) return false;
                  return s.id !== id;
                }); // so here we exclude them
          }
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
            return moment().diff(moment(bDate), "years");
          }
          return moment(dDate).diff(bDate, "years");
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

  // language=GraphQL
  const typeDefs = [
    `type Individual implements Node @dontInfer {
          name: Name
          sex: String
          occupation: String
          birth: Birth
          death: Death
          baptism: Baptism
          alive: Boolean @alive
          familyChild: Family @link
          familySpouse: [Family] @link
          age: Int @age
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
    schema.buildObjectType({
      name: "Source",
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
            context.nodeModel
              .getAllNodes({ type: "File" })
              .find(file => file.relativePath === source.image),
        },
      },
    }),
    `type Place @dontInfer {
          place: String!
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
  result.data.allIndividual.nodes.forEach(node => {
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
  result.data.allFamily.nodes.forEach(node => {
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
