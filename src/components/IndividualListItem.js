import { Avatar, Badge, List } from "antd";
import { ManOutlined, WomanOutlined } from "@ant-design/icons";
import { Link } from "gatsby";
import Highlight from "react-highlighter";
import React from "react";
import * as style from "./IndividualListItem.module.css";

export function IndividualListItem({
  search,
  individual: {
    id,
    name: { fullName },
    age,
    sex,
    alive,
  },
}) {
  const avatar = sex === "M" ? <ManOutlined /> : <WomanOutlined />;
  return (
    <List.Item>
      <List.Item.Meta
        avatar={<Avatar icon={avatar} />}
        title={
          <Link to={`/individual/${id}`}>
            <Badge
              status={alive ? "success" : undefined}
              title={"and counting..."}
            >
              {search ? (
                <Highlight matchClass={style.match} search={search}>
                  {fullName}
                </Highlight>
              ) : (
                <>{fullName}</>
              )}
            </Badge>
          </Link>
        }
        description={`Age: ${age ?? "Unknown"}`}
      />
    </List.Item>
  );
}
