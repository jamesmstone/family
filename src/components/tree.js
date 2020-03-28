import React from "react";
import DataSet from "@antv/data-set";
import Loadable from "@loadable/component";

const bizcharts = Loadable(() => import("bizcharts"), { ssr: false });
const { Chart, Coord, Geom, Label, Tooltip, View } = bizcharts;

export default function Tree({ data, direction = "TB" }) {
  let dv = new DataSet.View().source(data, {
    type: "hierarchy",
    pureData: true,
  });
  dv.transform({
    type: "hierarchy.dendrogram",
    // this layout algorithm needs to use pure data
    direction: direction,

    getHGap() {
      return 10;
    },

    getVGap() {
      return 10;
    },

    getHeight() {
      return 18;
    },

    getWidth(d) {
      return 18 * d.name.length;
    },
  });
  return (
    <Chart forceFit={true} padding={[100, 100, 100, 100]} height={600}>
      <Coord transpose />
      <Tooltip />
      <View
        data={dv.getAllLinks().map(link => ({
          x: [link.source.x, link.target.x],
          y: [link.source.y, link.target.y],
          source: link.source.id,
          target: link.target.id,
        }))}
      >
        <Geom
          type="edge"
          position="x*y"
          shape="line"
          color="grey"
          opacity={0.5}
          tooltip="source*target"
        />
      </View>
      <View
        data={dv.getAllNodes().map(node => ({
          hasChildren: !!(node.children && node.children.length),
          name: node.data.name,
          value: node.value,
          depth: node.depth,
          x: node.x,
          y: node.y,
        }))}
      >
        <Geom type="point" position="x*y" color="hasChildren">
          <Label
            content="name"
            textStyle={(text, item) => {
              const textAlign = item.point.hasChildren ? "left" : "right";
              return {
                fill: "grey",
                fontSize: 14,
                textBaseline: "below",
                textAlign: textAlign,
              };
            }}
            offset={0}
          />
        </Geom>
      </View>
    </Chart>
  );
}
