import React, { useState } from "react";
import { graphql, Link, useStaticQuery } from "gatsby";
import { Slider, Typography } from "antd";

import Layout from "../components/layout";
import SEO from "../components/seo";
import primitives from "basicprimitives";
import { FamDiagram } from "basicprimitivesreact";
import styles from "./familyTree.module.css";

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
          children: relationships(relationship: "children") {
            id
          }
          spouses: relationships(relationship: "spouse") {
            id
          }
          parents: relationships(relationship: "parents") {
            id
          }
          id
          sex
          age
          birth {
            date
            place {
              place
            }
          }
          death {
            date
            place {
              place
            }
          }
        }
      }
    }
  `);

  const individuals = is.map(i => {
    return {
      id: i.id,
      itemTitleColor: i.sex === "M" ? "#4169E1" : "#e1160d",
      title: i.name.fullName,
      groupTitle: i.sex === "M" ? "Male" : "Female",
      groupTitleColor: i.sex === "M" ? "#4169E1" : "#e1160d",
      label: i.name.fullName,
      description: i.age ? `Age: ${i.age}` : "",
      spouses: i.spouses.map(s => s.id),
      parents: i.parents.map(s => s.id),
      image: null,
      templateName: "templateA",
    };
  });
  return (
    <Layout>
      <SEO title="Family Tree" />
      <Typography.Title>Family Tree</Typography.Title>
      <FamilyTreeDiagram individuals={individuals} />
    </Layout>
  );
};

export default FamilyTree;

function FamilyTreeDiagram({
  individuals,
  showScale = true,
  initScale = 0.25,
}) {
  const [scale, setScale] = useState(initScale);
  const config = {
    scale,
    enablePanning: primitives.common.Enabled.True,
    pageFitMode: primitives.common.PageFitMode.SelectionOnly,
    cursorItem: 2,
    linesWidth: 1,
    linesColor: "black",
    hasSelectorCheckbox: primitives.common.Enabled.False,
    normalLevelShift: 20,
    dotLevelShift: 20,
    lineLevelShift: 20,
    normalItemsInterval: 10,
    dotItemsInterval: 30,
    lineItemsInterval: 30,
    // arrowsDirection: primitives.common.GroupByType.Parents,
    // showExtraArrows: false,
    showArrows: false,
    items: individuals,
    templates: [
      {
        name: "templateA",
        onItemRender: ({ context: itemConfig }) => {
          const itemTitleColor =
            itemConfig.itemTitleColor != null
              ? itemConfig.itemTitleColor
              : primitives.common.Colors.RoyalBlue;
          return (
            <div className={styles.TemplateA}>
              <div
                className={styles.titleBackground}
                style={{ backgroundColor: itemTitleColor }}
              >
                <div className={styles.title}>{itemConfig.title}</div>
              </div>
              <div className={styles.description}>
                {itemConfig.description}
                <br />
                <Link to={`/individual/${itemConfig.id}`}>View Profile</Link>
              </div>
            </div>
          );
        },
      },
    ],
  };

  return (
    <div style={{ height: "50vh" }}>
      {showScale && (
        <>
          <span>Scale</span>
          <Slider
            min={0.1}
            step={0.01}
            max={1}
            value={scale}
            tooltipVisible
            tipFormatter={value => `${Math.round(value * 100)}%`}
            onChange={setScale}
          />
        </>
      )}
      <FamDiagram centerOnCursor={true} config={config} />
    </div>
  );
}
