import { Avatar, List } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link } from "gatsby";
import React from "react";

export function IndividualListItem({
  individual: {
    id,
    name: { fullName },
    age,
  },
}) {
  return (
    <List.Item>
      <List.Item.Meta
        avatar={<Avatar icon={<UserOutlined />} />}
        title={<Link to={`/individual/${id}`}>{fullName}</Link>}
        description={`Age: ${age ?? "Unknown"}`}
      />
    </List.Item>
  );
}
