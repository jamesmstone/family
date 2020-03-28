import React from "react";
import { graphql, useStaticQuery } from "gatsby";
import { Descriptions, Typography } from "antd";

import Layout from "../components/layout";
import SEO from "../components/seo";

const StatsPage = () => {
  const {
    allIndividual: { bySex, bySurname, byGivenName },
  } = useStaticQuery(graphql`
    {
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
