import React from "react";
import { graphql } from "gatsby";
import { Map } from "./Map";
import { Marker, Popup, TileLayer } from "react-leaflet";
import { Sources } from "./Source";

export function IndividualMap({ map: { mapEvents } }) {
  return (
    <Map
      zoom={5}
      center={[51.505, -0.09]}
      style={{ minHeight: 300, height: "60vh" }}
    >
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mapEvents.map(({ title, date, source, place: { place, location } }) => {
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
