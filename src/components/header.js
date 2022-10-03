import React from "react";
import { Link } from "gatsby";
import PropTypes from "prop-types";
import { Layout, Menu } from "antd";
import {
  LineChartOutlined,
  PartitionOutlined,
  TeamOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

const items = [
  {
    key: "People",
    label: <Link to={"/"}>People</Link>,
    icon: <TeamOutlined />,
  },
  {
    key: "Stats",
    label: <Link to={"/stats"}>Stats</Link>,
    icon: <LineChartOutlined />,
  },
  {
    key: "Family Tree",
    label: <Link to={"/familyTree"}>Family Tree</Link>,
    icon: <PartitionOutlined rotate={270} />,
  },
  {
    key: "Family Map",
    label: <Link to={"/familyMap"}>Family Map</Link>,
    icon: <GlobalOutlined />,
  },
];

const Header = ({ siteTitle }) => (
  <Layout.Header>
    <Link style={{ float: "left", color: "#fff" }} to="/">
      {siteTitle}
    </Link>
    <Menu
      style={{ lineHeight: "64px" }}
      theme={"dark"}
      mode="horizontal"
      items={items}
    />
  </Layout.Header>
);

Header.propTypes = {
  siteTitle: PropTypes.string,
};

Header.defaultProps = {
  siteTitle: ``,
};

export default Header;
