import React from "react";
import { Link } from "react-router-dom";
import styles from "./index.module.scss";
import { Menu } from "antd";
import { connect } from "react-redux";

const MenuItem = Menu.Item;

const { SubMenu, ItemGroup } = Menu;

const mapStateToProps = (state) => {
  return state.nav?.top || {};
};

export default connect(mapStateToProps)(
  class extends React.Component<any> {
    handleClick = (e) => {
      const { dispatch } = this.props;
      dispatch({
        type: "SET_TOP_NAV",
        payload: {
          current: e.key,
        },
      });
    };

    render() {
      const { menus = [], current } = this.props;
      return (
        <div className={styles.top}>
          <Menu
            onClick={this.handleClick}
            selectedKeys={[current]}
            mode="horizontal"
          >
            <MenuItem key="home">
              <div style={{ width: "213px", textAlign: "center" }}>
                <a href="/">首页导航</a>
              </div>
            </MenuItem>
            {menus.map((menu: any) => {
              if (menu.children && menu.children.length) {
                const { title, children } = menu;
                return (
                  <SubMenu title={title}>
                    {children.map((child: any) => {
                      return <MenuItem key={child.key}>{child.title}</MenuItem>;
                    })}
                  </SubMenu>
                );
              }
              return (
                <MenuItem key={menu.key}>
                  <Link to="/pages">{menu.title}</Link>
                </MenuItem>
              );
            })}
          </Menu>
        </div>
      );
    }
  }
);
