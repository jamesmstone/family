import React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/layout";
export default ({ data }) => {
  const {
    family: { husband, wife, children },
  } = data;
  return (
    <Layout>
      <div>
        <dl>
          {husband && (
            <>
              <dt>Male</dt>
              <dl>
                <Link to={`/individual/${husband.id}`}>
                  {husband.name.fullName}
                </Link>
              </dl>
            </>
          )}
          {wife && (
            <>
              <dt>Female</dt>
              <dl>
                <Link to={`/individual/${wife.id}`}>{wife.name.fullName}</Link>
              </dl>
            </>
          )}
          {children && (
            <>
              <dt>Children</dt>
              <dl>
                <ul>
                  {children.map(child => (
                    <li key={child.id}>
                      <Link to={`/individual/${child.id}`}>
                        {child.name.fullName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </dl>
            </>
          )}
        </dl>
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
