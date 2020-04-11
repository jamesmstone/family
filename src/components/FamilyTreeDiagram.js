import React, { useState } from "react";
import primitives from "basicprimitives";
import styles from "../pages/familyTree.module.css";
import { Link } from "gatsby";
import { Slider } from "antd";
import { FamDiagram } from "basicprimitivesreact";

export function FamilyTreeDiagram({
  individuals,
  showScale = true,
  initScale = 0.25,
  height = "50vh",
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
    <div style={{ height: height }}>
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
