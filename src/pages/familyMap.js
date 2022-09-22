import React from "react";
import { graphql, useStaticQuery } from "gatsby";
import { Typography } from "antd";

import Layout from "../components/layout";
import SearchEngineOptimisation from "../components/searchEngineOptimisation";
import { MapEvents } from "../components/MapEvents";

const FamilyMap = () => {
  const {
    allIndividual: { nodes: individuals },
  } = useStaticQuery(graphql`
    {
      allIndividual(sort: { fields: birth___date, order: ASC }) {
        nodes {
          ...MapIdividual
        }
      }
    }
  `);

  return (
    <Layout>
      <SearchEngineOptimisation title="Family Tree Map" />
      <Typography.Title>Family Map</Typography.Title>
      <MapEvents individuals={individuals} />
    </Layout>
  );
};

export default FamilyMap;
