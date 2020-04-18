import { Timeline } from "antd";
import { Sources } from "./Source";
import React from "react";
import { HomeOutlined } from "@ant-design/icons";
import { graphql } from "gatsby";

export function EventsTimeline({ events }) {
  return (
    <Timeline>
      {events.map(({ title, place, date, source }, i) => (
        <Timeline.Item key={i} label={date} dot={getIcon(title)}>
          {title} - {place && place.place ? place.place : ""}
          {source && <Sources sources={source} />}
        </Timeline.Item>
      ))}
    </Timeline>
  );
}

export const query = graphql`
  fragment EventsTimeline on Individual {
    events: allEvent {
      title
      place {
        place
      }
      date(formatString: "YYYY-MM-DD")
      source {
        ...SourceInfo
      }
    }
  }
`;

function getIcon(title) {
  switch (title) {
    case "Residence":
      return <HomeOutlined />;
    default:
      return undefined;
  }
}
