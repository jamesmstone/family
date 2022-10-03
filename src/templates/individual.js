import React from "react";
import { graphql, Link } from "gatsby";
import { Badge, Col, Descriptions, Divider, Row, Tabs } from "antd";
import Layout from "../components/layout";
import { ManOutlined, WomanOutlined } from "@ant-design/icons";
import { Sources } from "../components/Source";
import { EventsTimeline } from "../components/EventsTimeline";
import { Pedigree } from "../components/Pedigree";
import { MapEvents } from "../components/MapEvents";

export default Individual;

function Individual({ data }) {
  const { individual, pedigree, map } = data;
  const { events } = individual;
  return (
    <Layout>
      <Row>
        <Col xs={24}>
          <Descriptions
            bordered
            title={
              <>
                {individual.name.fullName}
                {individual.name.source && (
                  <Sources sources={individual.name.source} />
                )}
              </>
            }
          >
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
                  {individual.familySpouse.map((family) => {
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
              <Descriptions.Item
                label={
                  <>
                    Birth
                    {individual.birth.source && (
                      <Sources sources={individual.birth.source} />
                    )}
                  </>
                }
              >
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
              <Descriptions.Item
                label={
                  <>
                    Baptism
                    {individual.baptism.source && (
                      <Sources sources={individual.baptism.source} />
                    )}
                  </>
                }
              >
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
              <Descriptions.Item
                label={
                  <>
                    Death
                    {individual.death.source && (
                      <Sources sources={individual.death.source} />
                    )}
                  </>
                }
              >
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
          <Tabs defaultActiveKey="Timeline">
            {events && (
              <Tabs.TabPane tab="Timeline" key="Timeline">
                <EventsTimeline events={events} />
              </Tabs.TabPane>
            )}
            {pedigree && (
              <Tabs.TabPane tab="Pedigree" key="Pedigree">
                <Pedigree pedigree={pedigree} />
              </Tabs.TabPane>
            )}
            {map && (
              <Tabs.TabPane tab="Map" key="Map">
                <MapEvents individuals={[map]} />
              </Tabs.TabPane>
            )}
          </Tabs>
        </Col>
      </Row>
    </Layout>
  );
}

export const query = graphql`
  query ($id: String!) {
    pedigree: individual(id: { eq: $id }) {
      ...Pedigree
    }
    map: individual(id: { eq: $id }) {
      ...MapIndividual
    }
    individual(id: { eq: $id }) {
      ...EventsTimeline

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
        source {
          ...SourceInfo
        }
      }
      baptism {
        date(formatString: "DD MMMM YYYY")
        place {
          place
        }
        source {
          ...SourceInfo
        }
      }
      death {
        died
        date(formatString: "DD MMMM YYYY")
        place {
          place
        }
        source {
          ...SourceInfo
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
