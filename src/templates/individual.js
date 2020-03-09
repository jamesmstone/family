import React from "react";
import { graphql, Link } from "gatsby";
import Layout from "../components/layout";
export default ({ data }) => {
  const { individual } = data;
  return (
    <Layout>
      <div>
        <h1>{individual.name.fullName}</h1>
        <dl>
          <dt>Sex</dt>
          <dd>{individual.sex}</dd>
          {individual.familyChild && (
            <>
              <dt>Child Family</dt>
              <dd>
                <Link to={`/family/${individual.familyChild.id}`}>Family</Link>
              </dd>
            </>
          )}
          {individual.familySpouse && (
            <>
              <dt>Partner Families</dt>
              <dd>
                <ul>
                  {individual.familySpouse.map(family => {
                    const partner =
                      family.husband && family.husband.id === individual.id
                        ? family.wife
                        : family.husband;
                    return (
                      <li key={family.id}>
                        <Link to={`/family/${family.id}`}>
                          Family
                          {partner && <span> w/ {partner.name.fullName} </span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </dd>
            </>
          )}
        </dl>
      </div>
    </Layout>
  );
};
export const query = graphql`
  query($id: String!) {
    individual(id: { eq: $id }) {
      id
      name {
        fullName
      }
      sex
      familyChild {
        id
      }
      familySpouse {
        id
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
      }
    }
  }
`;
