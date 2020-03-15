import React from "react";
import { graphql, useStaticQuery } from "gatsby";
import { Descriptions, Typography } from "antd";

import Layout from "../components/layout";
import SEO from "../components/seo";

const StatsPage = () => {
  const {
    allIndividual: { nodes: is },
  } = useStaticQuery(graphql`
    {
      allIndividual {
        nodes {
          name {
            fullName
          }
          id
        }
      }
    }
  `);

  return (
    <Layout>
      <SEO title="Stats" />
      <Typography.Title>Stats</Typography.Title>
      <Descriptions bordered title={"Names"}>
        <Descriptions.Item label={"Most common first name"}></Descriptions.Item>
      </Descriptions>
    </Layout>
  );
};

export default StatsPage;
