import { Avatar, Badge, List } from "antd";
import { ManOutlined, WomanOutlined } from "@ant-design/icons";
import { Link } from "gatsby";
import React from "react";

export function IndividualListItem({
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
              {fullName}
            </Badge>
          </Link>
        }
        description={`Age: ${age ?? "Unknown"}`}
      />
    </List.Item>
  );
}
