import React from "react";
import { graphql, Link } from "gatsby";
import { Badge, Col, Descriptions, Divider, Row, Timeline } from "antd";
import Layout from "../components/layout";
import { ManOutlined, WomanOutlined } from "@ant-design/icons";
import Source from "../components/Source";

export default ({ data }) => {
  const { individual } = data;
  const { events } = individual;
  return (
    <Layout>
      <Row>
        <Col xs={24}>
          <Descriptions bordered title={individual.name.fullName}>
            {individual.name.source && (
              <Descriptions.Item label={"Name Sources"}>
                {individual.name.source.map(s => (
                  <Source key={JSON.stringify(s)} source={s} />
                ))}
              </Descriptions.Item>
            )}
            <Descriptions.Item label={"Sex"}>
              {individual.sex}
              {individual.sex === "F" && <WomanOutlined />}
              {individual.sex === "M" && <ManOutlined />}
            </Descriptions.Item>
            {individual.occupation && (
              <Descriptions.Item label={"Occupation"}>
                {individual.occupation}
              </Descriptions.Item>
            )}
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
                status={individual.alive ? "success" : undefined}
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
            {individual.baptism && (
              <Descriptions.Item label={"Baptism"}>
                <Descriptions>
                  {individual.baptism.date && (
                    <Descriptions.Item label={"Date"}>
                      {individual.baptism.date}
                    </Descriptions.Item>
                  )}
                  {individual.baptism.place &&
                    individual.baptism.place.place && (
                      <Descriptions.Item label={"Place"}>
                        {individual.baptism.place.place}
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
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col xs={24}>
          {events && (
            <Timeline>
              {events.map(({ title, place, date, source }) => (
                <Timeline.Item label={date}>
                  {title} - {place && place.place ? place.place : ""}
                </Timeline.Item>
              ))}
            </Timeline>
          )}
        </Col>
      </Row>
    </Layout>
  );
};
export const query = graphql`
  query($id: String!) {
    individual(id: { eq: $id }) {
      events: allEvent {
        title
        place {
          place
        }
        date(formatString: "YYYY-MM-DD")
        source {
          ...SourceInfo
        }
      }
      id
      name {
        fullName
        source {
          ...SourceInfo
        }
      }
      alive
      birth {
        born
        date(formatString: "DD MMMM YYYY")
        place {
          place
        }
      }
      baptism {
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
      occupation
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
