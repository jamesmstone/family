import React, { useState } from "react";
import { graphql, useStaticQuery } from "gatsby";
import { Input, List, Typography } from "antd";

import Layout from "../components/layout";
import SearchEngineOptimisation from "../components/searchEngineOptimisation";
import { IndividualListItem } from "../components/IndividualListItem";

const IndexPage = () => {
  const {
    allIndividual: { nodes: is },
  } = useStaticQuery(graphql`
    {
      allIndividual(sort: { fields: birth___date, order: ASC }) {
        nodes {
          name {
            fullName
          }
          age
          id
          sex
          alive
        }
      }
    }
  `);

  const [search, setSearch] = useState();

  const individuals =
    search === undefined
      ? is
      : is.filter((i) =>
          i.name.fullName.toLowerCase().includes(search.toLowerCase())
        );
  return (
    <Layout>
      <SearchEngineOptimisation title="Home" />
      <Typography.Title>All Individuals</Typography.Title>
      <List
        header={
          <>
            <Input.Search
              onChange={({ target: { value } }) => setSearch(value)}
            />
            <p>
              Total: <span>{individuals.length}</span>
            </p>
          </>
        }
        itemLayout="horizontal"
        dataSource={individuals}
        renderItem={(individual) => (
          <IndividualListItem individual={individual} search={search} />
        )}
      />
    </Layout>
  );
};

export default IndexPage;
