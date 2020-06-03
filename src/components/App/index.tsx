import React from "react";
import styles from "./index.module.scss";
import { hot } from "react-hot-loader";
import { Top, Left } from "../Nav";
import { Row, Col } from "antd";
import Home from "../Home";
import NavEdit from "../NavEdit";
import Render from "../Render";
import Add from "../Add";
import Pages from "../Pages";
import { BrowserRouter, Route } from "react-router-dom";
import { connect } from "react-redux";
import { database, DEFAULT_OPTIONS } from "../../databases/index";
import { decode } from "../../utils";

const selector = (state: { nav: { left: any; top: { current: any } } }) => {
  return { navLeft: state.nav?.left, type: state.nav?.top?.current };
};
const pathReg = /\/(\w+)\/?/;
const isDev = process.env.NODE_ENV === "development";

const App = connect(selector)(
  class App extends React.Component<any, any> {
    async componentDidMount() {
      const { dispatch } = this.props;
      const nav = await database.query(
        `select left, top from ${DEFAULT_OPTIONS.nav}`
      );
      const { left = "", top = "" } = nav[0] || {};
      const matches = location.pathname.match(pathReg);
      dispatch({
        type: "RESET_NAV",
        payload: {
          left: decode(left) || {},
          top: {
            ...(decode(top) || {}),
            current: matches ? matches[1] : "",
          },
        },
      });
    }
    render() {
      const { type, navLeft = {} } = this.props;
      const hasLeftNav =
        navLeft.map && navLeft.map[type] && navLeft.map[type].length;
      return (
        <BrowserRouter>
          <Top
            navs={[
              {
                icon: "",
                title: "Home",
                link: "/home",
              },
            ]}
          />
          <div className={styles.content}>
            <Row className={styles.row}>
              {!!hasLeftNav && (
                <Col flex="254px">
                  <Left />
                </Col>
              )}
              <Col flex="1 1">
                <div className={styles.container}>
                  <Route exact path="/" component={Home}></Route>
                  <Route exact path="/nav" component={NavEdit}></Route>
                  <Route exact path="/pages" component={Pages}></Route>
                  <Route exact path="/pages/:id" component={Render}></Route>
                  <Route exact path="/add" component={Add}></Route>
                </div>
              </Col>
            </Row>
          </div>
        </BrowserRouter>
      );
    }
  }
);

export default isDev ? hot(module)(App) : App;
