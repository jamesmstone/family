import React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/layout";
import { Descriptions } from "antd";
import { Tree } from "../components/tree";

export default ({ data }) => {
  const {
    family: { husband, wife, children },
  } = data;
  const treeData = {
    name: `${husband && husband.name.fullName} & ${wife && wife.name.fullName}`,
    children: children.map(c => ({ name: c.name.fullName })),
  };

  return (
    <Layout>
      <div>
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
        <Tree data={treeData} />
      </div>
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
      }
      wife {
        id
        name {
          fullName
        }
      }
      children {
        ... on Individual {
          id
          name {
            fullName
          }
        }
      }
    }
  }
`;
