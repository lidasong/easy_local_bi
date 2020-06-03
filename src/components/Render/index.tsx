import React from "react";
import { ReactSortable } from "react-sortablejs";
import styles from "./index.module.scss";
import Chart from "../../chart";
import { database, DEFAULT_OPTIONS } from "../../databases";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Row, Col } from "antd";

const RowWrap = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  return (
    <div ref={ref} className={styles.row}>
      {props.children}
    </div>
  );
});

export default class extends React.Component<any, any> {
  state = {
    list: [] as any,
  };

  unlisten = null;

  constructor(props: any) {
    super(props);
    const { match } = this.props;
    const { id } = match.params || {};
    this.fetch(id);
  }

  componentDidMount() {
    const { history } = this.props;
    const selectedReg = /\/(\d+)\/?$/;

    this.unlisten = history.listen((location: Location) => {
      const { pathname } = location;
      const matches = pathname.match(selectedReg);
      const id = matches && matches[1];
      const { match } = this.props;
      const { id: pageId } = match.params || {};
      if (id !== pageId) {
        this.fetch(id);
      }
    });
  }

  componentWillUnmount() {
    this.unlisten && this.unlisten();
    this.unlisten = null;
  }

  async fetch(id: string) {
    const data = (await database.query(
      `SELECT components from ${
        DEFAULT_OPTIONS.pages
      } WHERE id=${JSON.stringify(id)}`
    )) as any;
    let components = data[0] && data[0].components;
    components = JSON.parse(decodeURIComponent(components)) || [];
    this.setState({
      list: [
        ...components,
        {
          id: "add",
          config: {
            filtered: true,
          },
        },
      ],
    });
  }

  setList = (list: any) => {
    this.setState({
      list,
    });
  };

  onDelComponent = async (id: any) => {
    const { match } = this.props;
    const { id: pageId } = match.params || {};
    const result = (await database.query(
      `select components from ${
        DEFAULT_OPTIONS.pages
      } where id=${JSON.stringify(pageId)}`
    )) as any[];
    let components = (result[0] && result[0].components) || "";
    components = JSON.parse(decodeURIComponent(components)) || [];
    components = components.filter((comp: any) => comp.id !== id);
    this.setState({
      list: [
        ...components,
        {
          id: "add",
          config: {
            filtered: true,
          },
        },
      ],
    });
    await database.update(
      DEFAULT_OPTIONS.pages,
      {
        components: encodeURIComponent(JSON.stringify(components)),
      },
      {
        id: pageId,
      }
    );
  };

  render() {
    const { list } = this.state;
    const { match } = this.props;
    const { id: pageId } = match.params || {};
    return (
      <div className={styles.wrapper}>
        <ReactSortable tag={RowWrap} list={list} setList={this.setList}>
          {list.map((component: any) => {
            const { title, config, id } = component;
            const isAdd = id === "add";
            if (isAdd) {
              return (
                <div className={`${styles.col} ${styles.add}`} id="add">
                  <Link to={`/add?page=${pageId}`}>
                    <div className={styles.inner}>
                      <PlusOutlined
                        className={styles.iconAdd}
                        style={{ fontSize: "48px", color: "#40a9ff" }}
                      />
                    </div>
                  </Link>
                </div>
              );
            }
            return (
              <div className={styles.col} key={id}>
                <div className={styles.inner}>
                  <Row className={styles.title}>
                    <Col flex={1}>
                      <div>{title}</div>
                    </Col>
                    <Col flex="24px">
                      <a onClick={() => this.onDelComponent(id)}>
                        <DeleteOutlined style={{ color: "#d20b0b" }} />
                      </a>
                    </Col>
                  </Row>
                  <Chart config={config} />
                </div>
              </div>
            );
          })}
        </ReactSortable>
      </div>
    );
  }
}
