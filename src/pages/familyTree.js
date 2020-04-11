import React from "react";
import {graphql, useStaticQuery} from "gatsby";
import {Typography} from "antd";

import Layout from "../components/layout";
import SEO from "../components/seo";
import {FamilyTreeDiagram} from "../components/FamilyTreeDiagram";

const FamilyTree = () => {
  const {
    allIndividual: { nodes: is },
  } = useStaticQuery(graphql`
    {
      allIndividual(sort: { fields: birth___date, order: ASC }) {
        nodes {
          name {
            fullName
          }
          children: relationships(relationship: "children") {
            id
          }
          spouses: relationships(relationship: "spouse") {
            id
          }
          parents: relationships(relationship: "parents") {
            id
          }
          id
          sex
          age
          birth {
            date
            place {
              place
            }
          }
          death {
            date
            place {
              place
            }
          }
        }
      }
    }
  `);

  const individuals = is.map(i => {
    return {
      id: i.id,
      itemTitleColor: i.sex === "M" ? "#4169E1" : "#e1160d",
      title: i.name.fullName,
      groupTitle: i.sex === "M" ? "Male" : "Female",
      groupTitleColor: i.sex === "M" ? "#4169E1" : "#e1160d",
      label: i.name.fullName,
      description: i.age ? `Age: ${i.age}` : "",
      spouses: i.spouses.map(s => s.id),
      parents: i.parents.map(s => s.id),
      image: null,
      templateName: "templateA",
    };
  });
  return (
    <Layout>
      <SEO title="Family Tree" />
      <Typography.Title>Family Tree</Typography.Title>
      <FamilyTreeDiagram individuals={individuals} />
    </Layout>
  );
};

export default FamilyTree;

