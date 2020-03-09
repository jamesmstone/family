import React from "react";
import { graphql, Link } from "gatsby";
import { Descriptions } from "antd";
import Layout from "../components/layout";
export default ({ data }) => {
  const { individual } = data;
  return (
    <Layout>
      <div>
        <Descriptions bordered title={individual.name.fullName}>
          <Descriptions.Item label={"Sex"}>{individual.sex}</Descriptions.Item>
          {individual.familyChild && (
            <Descriptions.Item label={"Childhood Family"}>
              <Link to={`/family/${individual.familyChild.id}`}>Family</Link>
            </Descriptions.Item>
          )}
          {individual.familySpouse && (
            <Descriptions.Item label={"Partner Families"}>
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
            </Descriptions.Item>
          )}
        </Descriptions>
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
