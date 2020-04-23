import React from "react";
import { graphql } from "gatsby";
import { Map } from "./Map";
import { Marker, Popup, TileLayer } from "react-leaflet";
import { Sources } from "./Source";

export function MapEvents({ events }) {
  return (
    <Map zoom={2} center={[15, 20]} style={{ minHeight: 300, height: "70vh" }}>
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {events.map(({ title, date, source, place: p }) => {
        if (!p) return null;
        const { place, location } = p;
        if (!location) return null;
        const { lat, lng } = location;
        return (
          <Marker key={`${title}${date}`} position={[lat, lng]}>
            <Popup>
              {title} - {place}
              {date ? `- ${date}` : ""} {source && <Sources sources={source} />}
            </Popup>
          </Marker>
        );
      })}
    </Map>
  );
}

export const query = graphql`
  fragment MapIdividual on Individual {
    mapEvents: allEvent {
      title
      place {
        place
        location {
          lng
          lat
        }
      }
      date(formatString: "YYYY-MM-DD")
      source {
        ...SourceInfo
      }
    }
  }
`;
