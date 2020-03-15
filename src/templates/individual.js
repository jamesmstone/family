import React from "react";
import { graphql, Link } from "gatsby";
import { Badge, Descriptions } from "antd";
import Layout from "../components/layout";
import { ManOutlined, WomanOutlined } from "@ant-design/icons";

export default ({ data }) => {
  const { individual } = data;
  const alive = individual.death === null;
  return (
    <Layout>
      <Descriptions bordered title={individual.name.fullName}>
        <Descriptions.Item label={"Sex"}>
          {individual.sex}
          {individual.sex === "F" && <WomanOutlined />}
          {individual.sex === "M" && <ManOutlined />}
        </Descriptions.Item>
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
        <Descriptions.Item label={"Age"}>
          <Badge
            status={alive ? "success" : undefined}
            title={"and counting..."}
          >
            {individual.age}
          </Badge>
        </Descriptions.Item>
        {individual.birth && (
          <Descriptions.Item label={"Birth"}>
            <Descriptions>
              {individual.birth.date && (
                <Descriptions.Item label={"Date"}>
                  {individual.birth.date}
                </Descriptions.Item>
              )}
              {individual.birth.place && individual.birth.place.place && (
                <Descriptions.Item label={"Place"}>
                  {individual.birth.place.place}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Descriptions.Item>
        )}
        {individual.death && (
          <Descriptions.Item label={"Death"}>
            <Descriptions>
              {individual.death.date && (
                <Descriptions.Item label={"Date"}>
                  {individual.death.date}
                </Descriptions.Item>
              )}
              {individual.death.place && individual.death.place.place && (
                <Descriptions.Item label={"Place"}>
                  {individual.death.place.place}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Descriptions.Item>
        )}
      </Descriptions>
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
      birth {
        born
        date(formatString: "DD MMMM YYYY")
        place {
          place
        }
      }
      death {
        died
        date(formatString: "DD MMMM YYYY")
        place {
          place
        }
      }
      age
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
