import React from "react";
import { Map as LeafletMap } from "react-leaflet";

export function Map({ children, ...props }) {
  if (typeof window !== "undefined") {
    return <LeafletMap {...props}>{children}</LeafletMap>;
  }
  return null;
}
