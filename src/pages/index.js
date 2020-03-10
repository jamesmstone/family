import React, { useState } from "react";
import { graphql, Link, useStaticQuery } from "gatsby";
import { Avatar, Input, List, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

import Layout from "../components/layout";
import SEO from "../components/seo";

const IndexPage = () => {
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

  const [search, setSearch] = useState();

  const individuals =
    search === undefined
      ? is
      : is.filter(i =>
          i.name.fullName.toLowerCase().includes(search.toLowerCase())
        );
  return (
    <Layout>
      <SEO title="Home" />
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
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={
                <Link to={`/individual/${item.id}`}>{item.name.fullName}</Link>
              }
            />
          </List.Item>
        )}
      />
      ,
    </Layout>
  );
};

export default IndexPage;
