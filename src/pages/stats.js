import React from "react";
import { graphql, useStaticQuery } from "gatsby";
import { Descriptions, List, Typography } from "antd";

import Layout from "../components/layout";
import SEO from "../components/seo";
import { IndividualListItem } from "../components/IndividualListItem";

const StatsPage = () => {
  const {
    oldest: { nodes: oldestPeople },
    allIndividual: { bySex, bySurname, byGivenName },
  } = useStaticQuery(graphql`
    {
      oldest: allIndividual(
        sort: { fields: age, order: DESC }
        filter: { age: { gte: 0 } }
        limit: 10
      ) {
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

      allIndividual {
        bySex: group(field: sex) {
          sex: fieldValue
          totalCount
        }
        bySurname: group(field: name___surname) {
          surname: fieldValue
          totalCount
        }
        byGivenName: group(field: name___given) {
          givenName: fieldValue
          totalCount
        }
      }
    }
  `);
  const sorter = ({ totalCount: a }, { totalCount: b }) => b - a;

  return (
    <Layout>
      <SEO title="Stats" />
      <Typography.Title>Stats</Typography.Title>
      <Typography.Title level={2}>Top ten oldest ages:</Typography.Title>
      <List
        itemLayout="horizontal"
        dataSource={oldestPeople}
        renderItem={individual => (
          <IndividualListItem individual={individual} />
        )}
      />
      <Typography.Title level={2}>Number of people by:</Typography.Title>
      <Descriptions bordered title={"Sex"}>
        {bySex.sort(sorter).map(({ sex, totalCount }) => {
          return (
            <Descriptions.Item key={sex} label={sex}>
              {totalCount}
            </Descriptions.Item>
          );
        })}
      </Descriptions>
      <Descriptions bordered title={"Surname"}>
        {bySurname.sort(sorter).map(({ surname, totalCount }) => {
          return (
            <Descriptions.Item key={surname} label={surname}>
              {totalCount}
            </Descriptions.Item>
          );
        })}
      </Descriptions>
      <Descriptions bordered title={"Given name"}>
        {byGivenName.sort(sorter).map(({ givenName, totalCount }) => {
          return (
            <Descriptions.Item key={givenName} label={givenName}>
              {totalCount}
            </Descriptions.Item>
          );
        })}
      </Descriptions>
    </Layout>
  );
};

export default StatsPage;
