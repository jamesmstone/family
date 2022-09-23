import React from "react";
import { graphql, Link } from "gatsby";
import { FamilyTreeDiagram } from "./FamilyTreeDiagram";
import { Colors, OrientationType, Size } from "basicprimitives";

const itemRenderer = ({ context: itemConfig }) => {
  const itemTitleColor =
    itemConfig.itemTitleColor != null
      ? itemConfig.itemTitleColor
      : Colors.RoyalBlue;
  return (
    <div style={{ background: itemTitleColor }}>
      <Link to={`/individual/${itemConfig.id}`}>
        <div style={{ color: "#FFF" }}>{itemConfig.title}</div>
      </Link>
    </div>
  );
};

export function Pedigree({
  pedigree: {
    children,
    parents,
    grandParents: gp,
    grandChildren: gc,
    ...other
  },
}) {
  const grandChildren = gc.flatMap(({ children }) => children);
  const grandParents = gp.flatMap(({ parents }) => parents);
  const individuals = [
    { ...other, parents },
    ...parents,
    ...grandParents,
    ...grandChildren,
    ...children,
  ].filter((i) => !!i);

  return (
    <FamilyTreeDiagram
      orientation={OrientationType.Right}
      individuals={individuals}
      itemRenderer={itemRenderer}
      itemSize={new Size(200, 15)}
      width={"100%"}
      height={330}
      showScale={false}
      initScale={1}
      showGroupTitle={false}
    />
  );
}

export const query = graphql`
  fragment Pedigree on Individual {
    ...FamilyTreeIndividualInfo
    children: relationships(relationship: "children") {
      ...FamilyTreeIndividualInfo
    }
    grandChildren: relationships(relationship: "children") {
      children: relationships(relationship: "children") {
        ...FamilyTreeIndividualInfo
      }
    }
    parents: relationships(relationship: "parents") {
      ...FamilyTreeIndividualInfo
    }
    grandParents: relationships(relationship: "parents") {
      parents: relationships(relationship: "parents") {
        ...FamilyTreeIndividualInfo
      }
    }
  }
`;
