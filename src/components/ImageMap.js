import React from "react";
import { graphql } from "gatsby";
import { Map } from "./Map";
import L from "leaflet";
import { ZoomControl, ImageOverlay } from "react-leaflet";

const defaultStyle = { minHeight: 300, height: "70vh" };
const bounds = [
  [0, 0],
  [1000, 1000],
];

export function ImageMap({
  image: {
    original: { width, height, src },
  },
  style: s,
}) {
  const style = { ...defaultStyle, ...s };

  return (
    <Map
      zoomControl={false} // overridden later
      bounds={bounds}
      crs={L.CRS.Simple}
      minZoom={-5}
      zoom={2}
      center={[15, 20]}
      style={style}
    >
      <ZoomControl position="topright" />
      <ImageOverlay url={src} bounds={bounds} />
    </Map>
  );
}

export const query = graphql`
  fragment ImageMap on ImageSharp {
    original {
      height
      src
      width
    }
  }
`;
