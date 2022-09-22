import React, { useState } from "react";
import { PageFitMode, OrientationType, Colors, Enabled } from "basicprimitives";
import * as styles from "../pages/familyTree.module.css";
import { graphql, Link } from "gatsby";
import { Slider } from "antd";
import { FamDiagram } from "basicprimitivesreact";

export const query = graphql`
  fragment FamilyTreeIndividualInfo on Individual {
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
`;

export function FamilyTreeDiagram({
  showGroupTitle = true,
  orientation = OrientationType.Top,
  individuals: is,
  itemSize = undefined,
  itemRenderer = ({ context: itemConfig }) => {
    const itemTitleColor =
      itemConfig.itemTitleColor != null
        ? itemConfig.itemTitleColor
        : Colors.RoyalBlue;
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
  showScale = true,
  initScale = 1,
  height = "50vh",
  width,
  pageFitMode = PageFitMode.None,
}) {
  const individuals = is.map(i => {
    let ret = {
      id: i.id,
      itemTitleColor: i.sex === "M" ? "#4169E1" : "#e1160d",
      title: i.name.fullName,
      label: i.name.fullName,
      description: i.age ? `Age: ${i.age}` : "",
      spouses: i.spouses.map(s => s.id),
      parents: i.parents.map(s => s.id),
      image: null,
      templateName: "templateA",
    };
    if (showGroupTitle) {
      ret["groupTitle"] = i.sex === "M" ? "Male" : "Female";
      ret["groupTitleColor"] = i.sex === "M" ? "#4169E1" : "#e1160d";
    }
    return ret;
  });

  const [scale, setScale] = useState(initScale);
  const config = {
    orientationType: orientation,
    scale,
    pageFitMode,
    cursorItem: 2,
    linesWidth: 1,
    linesColor: "black",
    hasSelectorCheckbox: Enabled.False,
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
        onItemRender: itemRenderer,
        itemSize,
      },
    ],
  };

  return (
    <div style={{ height, width }}>
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
