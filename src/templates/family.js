import React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/layout";
import { Descriptions } from "antd";
import { FamilyTreeDiagram } from "../components/FamilyTreeDiagram";
import SEO from "../components/seo";

export default ({ data }) => {
  const {
    family: { husband, wife, children },
  } = data;

  const individuals = [husband, wife, ...children].filter(i => i !== null);
  return (
    <Layout>
      <SEO title="Family Tree" />
      <Descriptions bordered>
        {husband && (
          <Descriptions.Item label={"Male"}>
            <Link to={`/individual/${husband.id}`}>
              {husband.name.fullName}
            </Link>
          </Descriptions.Item>
        )}
        {wife && (
          <Descriptions.Item label={"Female"}>
            <Link to={`/individual/${wife.id}`}>{wife.name.fullName}</Link>
          </Descriptions.Item>
        )}
        {children && (
          <Descriptions.Item label={"Children"}>
            <ul>
              {children.map(child => (
                <li key={child.id}>
                  <Link to={`/individual/${child.id}`}>
                    {child.name.fullName}
                  </Link>
                </li>
              ))}
            </ul>
          </Descriptions.Item>
        )}
      </Descriptions>
      <FamilyTreeDiagram
        individuals={individuals}
        width={"100%"}
        showScale={false}
        initScale={1}
      />
    </Layout>
  );
};
export const query = graphql`
  query($id: String!) {
    family(id: { eq: $id }) {
      husband {
        id
        name {
          fullName
        }
        ...FamilyTreeIndividualInfo
      }
      wife {
        id
        name {
          fullName
        }
        ...FamilyTreeIndividualInfo
      }
      children {
        ... on Individual {
          id
          name {
            fullName
          }
          ...FamilyTreeIndividualInfo
        }
      }
    }
  }
`;
