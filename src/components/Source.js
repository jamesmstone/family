import React from "react";
import { graphql } from "gatsby";
import Img from "gatsby-image";
import { Button, Modal } from "antd";

export default ({ source: { thumbnail, image, page } }) => {
  function modal() {
    Modal.info({
      title: page ?? "Source",
      closable: true,
      content: image && <Img fixed={image.childImageSharp.fixed} />,
    });
  }
  return (
    <Button
      style={{ fontSize: 14, fontWeight: "none", color: "rgba(0,0,0,0.65)" }}
      ghost
      type={"link"}
      onClick={modal}
    >
      {page && <h4>{page}</h4>}
      {thumbnail && <Img fixed={thumbnail.childImageSharp.fixed} />}
    </Button>
  );
};
export const query = graphql`
  fragment SourceInfo on Source {
    page
    thumbnail: image {
      childImageSharp {
        fixed(width: 125, height: 125) {
          ...GatsbyImageSharpFixed
        }
      }
    }
    image {
      childImageSharp {
        fixed(width: 900) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`;
