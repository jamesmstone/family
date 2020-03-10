import React from "react";
import { graphql, Link, useStaticQuery } from "gatsby";
import { Avatar, List, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

import Layout from "../components/layout";
import SEO from "../components/seo";

const IndexPage = () => {
  const {
    allIndividual: { nodes: individuals },
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
      <SEO title="Home" />
      <Typography.Title>All Individuals</Typography.Title>
      <List
        header={
          <p>
            Total: <span>{individuals.length}</span>
          </p>
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
