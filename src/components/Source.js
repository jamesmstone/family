import React from "react";
import { graphql } from "gatsby";
import { Button, Modal, Tooltip } from "antd";
import { ImageMap } from "./ImageMap";

const modalWidth = "95vw";
const antModalPadding = "300px";

function Source({ i, source: { image, page } }) {
  function modal() {
    Modal.info({
      maskClosable: true,
      title: page ?? "Source",
      closable: true,
      width: modalWidth,
      content: image && (
        <ImageMap
          style={{ width: `calc(${modalWidth}-2*${antModalPadding})` }}
          image={image.imageMap}
        />
      ),
    });
  }
  return (
    <Tooltip title={page ?? `source ${i}`}>
      <Button
        disabled={!image}
        style={{ padding: 0 }}
        type={"link"}
        onClick={modal}
      >
        <sup>[{i}]</sup>
      </Button>
    </Tooltip>
  );
}

export const query = graphql`
  fragment SourceInfo on Source {
    page
    image {
      imageMap: childImageSharp {
        ...ImageMap
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
