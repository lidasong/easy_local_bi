import React from "react";
import { Link } from "react-router-dom";
import styles from "./index.module.scss";
import { Menu, message, Row, Col } from "antd";
import { connect } from "react-redux";
import { database, DEFAULT_OPTIONS } from "../../../databases/index";
import { DeleteOutlined } from "@ant-design/icons";

const MenuItem = Menu.Item;

const { SubMenu } = Menu;

const selectedReg = /\/(\d+)\/?$/;

export default connect((state) => {
  return { ...state.nav?.left, type: state.nav?.top?.current };
})(
  class extends React.Component<any, any> {
    constructor(props: any) {
      super(props);
      const matches = location.pathname.match(selectedReg);
      this.state = {
        defaultSelectedKeys: matches ? [matches[1]] : [],
      };
    }
    onDelMenu = async (key: string) => {
      try {
        const id = this.state.defaultSelectedKeys[0];
        const navs: any = await database.query(
          `select left from ${DEFAULT_OPTIONS.nav}`
        );
        let left = navs[0]?.left;
        left = JSON.parse(decodeURIComponent(left));
        left = {
          ...left,
          map: {
            ...left.map,
            pages: left.map.pages.filter((page: any) => page.key !== key),
          },
        };
        await database.update(DEFAULT_OPTIONS.nav, {
          left: encodeURIComponent(JSON.stringify(left)),
        });
        await database.del(DEFAULT_OPTIONS.pages, { id });
        location.href = "/pages";
      } catch (err) {
        message.error(err.message);
      }
    };
    renderMenuItem(menus: any) {
      const { type = "" } = this.props;
      return menus.map((menu: any) => {
        const { key, title } = menu;
        if (menu.children && menu.children.length) {
          return (
            <SubMenu key={key} title={title}>
              {this.renderMenuItem(menu.children)}
            </SubMenu>
          );
        }
        return (
          <MenuItem key={key}>
            <Row>
              <Col flex={1}>
                <Link to={`/${type}/${key}`}>{title}</Link>
              </Col>
              <Col flex="18px">
                <a onClick={() => this.onDelMenu(key)}>
                  <DeleteOutlined />
                </a>
              </Col>
            </Row>
          </MenuItem>
        );
      });
    }
    render() {
      const { type = "default", map = {} } = this.props;
      const menus = map[type] || [];
      const { defaultSelectedKeys } = this.state;
      return (
        <div className={styles.menus}>
          <Menu
            defaultSelectedKeys={defaultSelectedKeys}
            mode="inline"
            theme="light"
          >
            {this.renderMenuItem(menus)}
          </Menu>
        </div>
      );
    }
  }
);
