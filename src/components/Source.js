import React from "react";
import { graphql } from "gatsby";
import Img from "gatsby-image";
import { Button, Modal, Tooltip } from "antd";

function Source({ i, source: { thumbnail, image, page } }) {
  function modal() {
    Modal.info({
      title: page ?? "Source",
      closable: true,
      content: image && <Img fixed={image.childImageSharp.fixed} />,
    });
  }
  return (
    <Tooltip title={page ?? `source ${i}`}>
      <Button style={{ padding: 0 }} type={"link"} onClick={modal}>
        <sup>[{i}]</sup>
      </Button>
    </Tooltip>
  );
}
export const query = graphql`
  fragment SourceInfo on Source {
    page
    image {
      childImageSharp {
        fixed(width: 300) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`;

export function Sources({ sources }) {
  return (
    <>
      {sources.map((s, i) => (
        <Source key={JSON.stringify(s)} i={i + 1} source={s} />
      ))}
    </>
  );
}

export default Source;
