import React from "react";
import { MapContainer } from "react-leaflet";

export function Map({ children, ...props }) {
  if (typeof window !== "undefined") {
    return <MapContainer {...props}>{children}</MapContainer>;
  }
  return null;
}
