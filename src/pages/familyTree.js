import React, { useState } from "react";
import { graphql, Link, useStaticQuery } from "gatsby";
import { Avatar, Input, List, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";

import Layout from "../components/layout";
import SEO from "../components/seo";
import primitives from "basicprimitives";
import { FamDiagram } from "basicprimitivesreact";

const FamilyTree = () => {
  const {
    allIndividual: { nodes: is },
  } = useStaticQuery(graphql`
    {
      allIndividual(sort: { fields: birth___date, order: ASC }) {
        nodes {
          name {
            fullName
          }
          id
        }
      }
    }
  `);

  const [search, setSearch] = useState();

  const individuals =
    search === undefined
      ? is
      : is.filter(i =>
          i.name.fullName.toLowerCase().includes(search.toLowerCase())
        );
  return (
    <Layout>
      <SEO title="Home" />
      <Sample />
      <Typography.Title>All Individuals</Typography.Title>
      <List
        header={
          <>
            <Input.Search
              onChange={({ target: { value } }) => setSearch(value)}
            />
            <p>
              Total: <span>{individuals.length}</span>
            </p>
          </>
        }
        itemLayout="horizontal"
        dataSource={individuals}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={
                <Link to={`/individual/${item.id}`}>{item.name.fullName}</Link>
              }
            />
          </List.Item>
        )}
      />
    </Layout>
  );
};

export default FamilyTree;

function Sample() {
  const config = {
    pageFitMode: primitives.common.PageFitMode.None,
    cursorItem: 2,
    linesWidth: 1,
    linesColor: "black",
    hasSelectorCheckbox: primitives.common.Enabled.True,
    normalLevelShift: 20,
    dotLevelShift: 20,
    lineLevelShift: 20,
    normalItemsInterval: 10,
    dotItemsInterval: 30,
    lineItemsInterval: 30,
    arrowsDirection: primitives.common.GroupByType.Parents,
    showExtraArrows: false,
    items: [
      {
        id: 1,
        spouses: [2],
        title: "Thomas Williams",
        label: "Thomas Williams",
        description: "1, 1st husband",
        image: "/photos/t.png",
      },
      {
        id: 2,
        title: "Mary Spencer",
        label: "Mary Spencer",
        description: "2, The Mary",
        image: "/photos/m.png",
        relativeItem: 1,
        placementType: primitives.common.AdviserPlacementType.Right,
        position: 1,
      },
      {
        id: 3,
        spouses: [2],
        title: "David Kirby",
        label: "David Kirby",
        description: "3, 2nd Husband",
        image: "/photos/d.png",
        relativeItem: 2,
        placementType: primitives.common.AdviserPlacementType.Right,
        position: 1,
      },
      {
        id: 4,
        parents: [1, 2],
        title: "Brad Williams",
        label: "Brad Williams",
        description: "4, 1st son",
        image: "/photos/b.png",
      },
      {
        id: 5,
        parents: [2, 3],
        spouses: [6, 7],
        title: "Mike Kirby",
        label: "Mike Kirby",
        description: "5, 2nd son, having 2 spouses",
        image: "/photos/m.png",
      },
      {
        id: 6,
        title: "Lynette Maloney",
        label: "Lynette Maloney",
        description: "5, Spouse 1",
        image: "/photos/m.png",
        relativeItem: 5,
        placementType: primitives.common.AdviserPlacementType.Right,
        position: 1,
      },
      {
        id: 7,
        title: "Sara Kemp",
        label: "Sara Kemp",
        description: "5, Spouse 2",
        image: "/photos/s.png",
        relativeItem: 5,
        placementType: primitives.common.AdviserPlacementType.Left,
        position: 1,
      },
      {
        id: 8,
        parents: [5, 7],
        title: "Leon Kemp",
        label: "Leon Kemp",
        description: "5, First Child",
        image: "/photos/l.png",
      },
    ],
  };

  return (
    <div style={{height:600}}>
      <FamDiagram centerOnCursor={true} config={config} />
    </div>
  );
}
