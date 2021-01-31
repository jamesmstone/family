import React from "react";
import { graphql, useStaticQuery } from "gatsby";
import { Typography } from "antd";

import Layout from "../components/layout";
import SEO from "../components/seo";
import { FamilyTreeDiagram } from "../components/FamilyTreeDiagram";
import { PageFitMode } from "basicprimitives";

const FamilyTree = () => {
  const {
    allIndividual: { nodes: individuals },
  } = useStaticQuery(graphql`
    {
      allIndividual(sort: { fields: birth___date, order: ASC }) {
        nodes {
          ...FamilyTreeIndividualInfo
        }
      }
    }
  `);

  return (
    <Layout>
      <SEO title="Family Tree" />
      <Typography.Title>Family Tree</Typography.Title>
      <FamilyTreeDiagram
        individuals={individuals}
        initScale={0.25}
        pageFitMode={PageFitMode.SelectionOnly}
      />
    </Layout>
  );
};

export default FamilyTree;
