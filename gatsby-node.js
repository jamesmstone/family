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

    switch (tag) {
      case "INDI":
        const [{ tree: nameTree }] = findTags("NAME");
        const given = findTagData("GIVN", nameTree);
        const surname = findTagData("SURN", nameTree);

        let death, birth;
        if (hasTag("DEAT")) {
          let [{ tree: deathTree }] = findTags("DEAT");
          let died =
            (deathTree.length === 0 && findTagData("DEAT") === "Y") || true;
          death = {
            died,
            place: findTagData("PLAC", deathTree),
            date: findTagData("DATE", deathTree),
          };
        }
        if (hasTag("BIRT")) {
          let [{ tree: birthTree }] = findTags("BIRT");
          birth = {
            born: true,
            place: findTagData("PLAC", birthTree),
            date: findTagData("DATE", birthTree),
          };
        }
        const sex = findTagData("SEX");
        const familyChild = findTagData("FAMC");
        const familySpouse = findTags("FAMS").map(({ data }) =>
          createNodeId(data)
        );

        return {
          name: {
            given: given,
            surname: surname,
          },
          sex,
          birth,
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
      age:{
        type: "Number",

      },
      relationships: {
        type: ["Individual"],
        args: {
          relationship: "String!",
        },
        resolve(
          { familyChild, familySpouse },
          { relationship },
          context,
          info
        ) {
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
              const famc = getFamC();
              return famc !== null && famc.hasOwnProperty("husband")
                ? [getIndividual(famc.husband)]
                : null;
            case "mother":
              const fam = getFamC();
              return fam !== null && fam.hasOwnProperty("wife")
                ? [getIndividual(fam.wife)]
                : null;
            case "children":
              return getFamSs().flatMap(({ children }) =>
                children.map(c => getIndividual(c))
              );
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

  // language=GraphQL
  const typeDefs = [
    `type Individual implements Node @dontInfer {
          name: Name
          sex: String
          birth: Birth
          death: Death
          familyChild: Family @link
          familySpouse: [Family] @link
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
      }`,
    `type Birth @dontInfer {
          born:Boolean
          place: Place
          date:Date
      }`,
    `type Death @dontInfer {
          died: Boolean
          place: Place
          date:Date
      }`,
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
