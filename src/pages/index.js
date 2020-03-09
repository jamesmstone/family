import React from "react";
import { graphql, Link, useStaticQuery } from "gatsby";

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
      <h1>All Individuals</h1>
      <p>
        Total: <span>{individuals.length}</span>
      </p>
      <ul>
        {individuals.map(d => (
          <li key={d.id}>
            <Link to={`/individual/${d.id}`}>{d.name.fullName}</Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export default IndexPage;
