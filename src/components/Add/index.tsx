import React from "react";
import { Row, Col, Select, Input, Button, message } from "antd";
import Field from "./Field";
import Attr from "./Attr";
import Axis from "./Axis";
import { ReactSortable, SortableEvent } from "react-sortablejs";
import styles from "./index.module.scss";
import Chart from "../../chart";
import { database, DEFAULT_OPTIONS } from "../../databases/index";
import { connect } from "react-redux";

const { Option } = Select;
const attrTitle = {
  color: "颜色",
  size: "尺寸",
  label: "文本",
  angle: "角度",
};
const chartTypes = [
  {
    title: "自动",
    value: "auto",
  },
  {
    title: "柱图",
    value: "bar",
  },
  {
    title: "堆叠柱图",
    value: "barStack",
  },
  {
    title: "并列柱图",
    value: "barAlign",
  },
  {
    title: "线图",
    value: "line",
  },
  {
    title: "点图",
    value: "point",
  },
  {
    title: "区域图",
    value: "area",
  },
  {
    title: "区域堆叠图",
    value: "areaStack",
  },
  {
    title: "饼图",
    value: "pie",
  },
  {
    title: "指环图",
    value: "ring",
  },
  {
    title: "双轴图",
    value: "duplex",
  },
];

const RowWrap = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  return (
    <div ref={ref} className="ant-row">
      {props.children}
    </div>
  );
});
const mapStateToProps = (state) => {
  return state;
};
export default connect(mapStateToProps)(
  class extends React.Component<any> {
    state = {
      title: "标题",
      tbName: "",
      tables: [],
      id: Math.random().toString().slice(2),
      config: {
        row: [],
        column: [],
        geom: {
          type: "auto",
        },
      } as any,
      dimensions: [],
      measures: [],
      attr: {
        color: [],
        size: [],
        label: [],
        angle: [],
      },
      axis: {
        row: [],
        column: [],
      },
    };
    constructor(props) {
      super(props);
      const { dispatch } = props;
      this.fetchTables();
      dispatch({
        type: "SET_TOP_NAV",
        payload: {
          current: "add",
        },
      });
    }
    async fetchTables() {
      const tables = (await database.query(
        "SELECT distinct tb_name from my_table_field "
      )) as any[];
      const tbName = (tables[0] && tables[0].tb_name) || "";
      this.setState({ tables: tables || [], tbName });
      tables.length && this.fetchFields(tbName);
    }
    onChangeTable = (tbName: string) => {
      this.setState({
        tbName,
        attr: {
          color: [],
          size: [],
          label: [],
          angle: [],
        },
        axis: {
          row: [],
          column: [],
        },
      });
      this.fetchFields(tbName);
    };
    fetchData = async ({ axis, attr }: any) => {
      const { tbName, config } = this.state;
      const { row = [], column = [] } = {
        ...this.state.axis,
        ...axis,
      };
      attr = {
        ...this.state.attr,
        ...attr,
      };
      const { color = [], label = [], size = [], angle = [] } = attr;
      const { dimensions, measures } = row
        .concat(column, color, label, size, angle)
        .reduce(
          (result: any, field: any) => {
            if (field.type === "dimension") {
              result.dimensions.push(field);
            } else {
              result.measures.push(field);
            }
            return result;
          },
          {
            dimensions: [],
            measures: [],
          }
        );
      if (!dimensions.length || !measures.length) {
        return;
      }
      try {
        const data = await database.query(
          `SELECT ${dimensions
            .map((dim: any) => dim.field)
            .join(",")},${measures.map((measure: any) => {
            const aggr = measure.aggr || "sum";
            if (aggr === "countd") {
              return `count (distinct(${measure.field})) as ${measure.field}`;
            }
            return `${aggr}(${measure.field}) as ${measure.field}`;
          })} FROM ${tbName} group by ${
            dimensions.map((dim: any) => dim.field).join(",") || "1"
          }`
        );
        this.setState({
          config: {
            ...config,
            row: row.length === 1 ? row[0] : row,
            column: column.length === 1 ? column[0] : column,
            geom: {
              ...config.geom,
              ...Object.keys(attr).reduce((result: any, key) => {
                if (attr[key].length) {
                  result[key] = attr[key][0];
                } else {
                  result[key] = undefined;
                }
                return result;
              }, {}),
            },
            data,
          },
        });
      } catch (err) {
        message.error(err.message);
      }
    };
    setAxis = ({ type, fields }: any) => {
      const { axis } = this.state;
      const newAxis = {
        ...axis,
        [type]: fields,
      };
      this.setState({
        axis: newAxis,
      });
      this.fetchData({
        axis: newAxis,
      });
    };
    onSetAggr = (type: string, index: number, aggr: string) => {
      const { axis } = this.state;
      const fields = axis[type];
      let field = fields[index];
      if (field.aggr === aggr) {
        return;
      }
      field = {
        ...fields[index],
        aggr,
      };
      const newAxis = {
        ...axis,
        [type]: fields.map((item: any, ind: number) => {
          if (ind === index) {
            return field;
          }
          return item;
        }),
      };
      this.setState({
        axis: newAxis,
      });
      this.fetchData({
        axis: newAxis,
      });
    };
    setAttr = ({ type, fields }) => {
      const { attr } = this.state;
      const newAttr = {
        ...attr,
        [type]: fields,
      };
      this.setState({
        attr: newAttr,
      });
      this.fetchData({
        attr: newAttr,
      });
    };
    onSetAttrAggr = (type: string, aggr: string) => {
      const { attr } = this.state;
      const field = attr[type][0];
      if (field.aggr === aggr) {
        return;
      }
      const fields = [
        {
          ...attr[type][0],
          aggr,
        },
      ];
      const newAttr = {
        ...attr,
        [type]: fields,
      };
      this.setState({
        attr: newAttr,
      });
      this.fetchData({
        attr: newAttr,
      });
    };
    onChangeType = (type: string) => {
      const { config } = this.state;
      this.setState({
        config: {
          ...config,
          geom: {
            ...config.geom,
            type,
          },
        },
      });
    };
    async fetchFields(tbName: string) {
      const fields: any = await database.query(
        `SELECT field, type from ${DEFAULT_OPTIONS.tbName} WHERE tb_name='${tbName}'`
      );
      const { dimensions, measures } = fields.reduce(
        (result: any, field: any) => {
          if (field.type === "number") {
            result.measures.push({
              type: "measure",
              dataType: field.type,
              field: field.field,
            });
          } else {
            result.dimensions.push({
              type: "dimension",
              dataType: field.type,
              field: field.field,
            });
          }
          return result;
        },
        {
          dimensions: [],
          measures: [],
        }
      );
      this.setState({
        dimensions,
        measures,
      });
    }
    doAdd = async () => {
      const { history } = this.props;
      const { id, title, config } = this.state;
      const [_, pageId] = history.location.search.match(/page=(\d+)/);
      try {
        const result = (await database.query(
          `select components from ${
            DEFAULT_OPTIONS.pages
          } where id=${JSON.stringify(pageId)}`
        )) as any[];
        let components = (result[0] && result[0].components) || "";
        components = JSON.parse(decodeURIComponent(components)) || [];
        await database.update(
          DEFAULT_OPTIONS.pages,
          {
            components: encodeURIComponent(
              JSON.stringify([
                ...components,
                {
                  id,
                  title,
                  config,
                },
              ])
            ),
          },
          {
            id: pageId,
          }
        );
        history.replace(`/pages/${pageId}`);
      } catch (err) {
        message.error(err.message);
      }
    };
    render() {
      const {
        dimensions = [],
        measures = [],
        attr,
        axis,
        title,
        config,
        tables = [],
        tbName,
      } = this.state;
      return (
        <Row align="top">
          <Col flex="240px">
            <Select
              style={{ width: "88%" }}
              onChange={this.onChangeTable}
              value={tbName}
            >
              {tables.map((table: any) => {
                const { tb_name } = table;
                return (
                  <Option key={tb_name} value={tb_name}>
                    {tb_name}
                  </Option>
                );
              })}
            </Select>
            <div className={styles.fieldType}>维度</div>
            <div className={styles.fieldWrap}>
              <ReactSortable
                animation={150}
                list={dimensions}
                setList={(dimensions: any[]) =>
                  this.setState({
                    dimensions,
                  })
                }
                group={{
                  name: "field_dimension_group",
                  pull: "clone",
                  put: false,
                }}
              >
                {dimensions.map((dim: any) => {
                  return (
                    <div style={{ margin: "4px" }} key={dim.field}>
                      <Field type="dimension" {...dim} />
                    </div>
                  );
                })}
              </ReactSortable>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.fieldType}>度量</div>
            <div className={styles.fieldWrap}>
              <ReactSortable
                animation={150}
                list={measures}
                setList={(measures: any[]) =>
                  this.setState({
                    measures,
                  })
                }
                group={{
                  name: "field_measure_group",
                  pull: "clone",
                  put: false,
                }}
              >
                {measures.map((measure: any) => {
                  return (
                    <div style={{ margin: "4px" }} key={measure.field}>
                      <Field type="measure" {...measure} />
                    </div>
                  );
                })}
              </ReactSortable>
            </div>
          </Col>
          <Col flex="180px">
            <div className={styles.chartType}>
              <Select
                style={{ width: "100%" }}
                onChange={this.onChangeType}
                value={config.geom.type}
              >
                {chartTypes.map((type: any) => {
                  return (
                    <Option key={type.value} value={type.value}>
                      {type.title}
                    </Option>
                  );
                })}
              </Select>
            </div>
            {Object.keys(attr).map((key: string) => {
              return (
                <Attr key={key} type={key} title={attrTitle[key]}>
                  <div className={styles.attrList}>
                    <ReactSortable
                      list={attr[key]}
                      setList={(list: any) => {
                        this.setAttr({
                          type: key,
                          fields: list,
                        });
                      }}
                      onEnd={(evt: SortableEvent) => {
                        const { oldIndex, newIndex, from, to } = evt;
                        if (from === to && oldIndex === newIndex) {
                          setTimeout(
                            () =>
                              this.setAttr({
                                type: key,
                                fields: [],
                              }),
                            0
                          );
                        }
                      }}
                      group={{
                        name: "field_dimension_group field_measure_group",
                        put: () => {
                          return this.state.attr[key].length < 1;
                        },
                      }}
                    >
                      {attr[key].map((field: any) => {
                        return (
                          <Field
                            key={field.field}
                            type={field.type}
                            {...field}
                            dropdown={field.type === "measure"}
                            onChooseAggr={({ key: aggr }: any) =>
                              this.onSetAttrAggr(key, aggr)
                            }
                          />
                        );
                      })}
                    </ReactSortable>
                  </div>
                </Attr>
              );
            })}
          </Col>
          <Col flex="1" className={styles.axisWrap}>
            {["row", "column"].map((type: string) => {
              return (
                <Axis type={type} key={type}>
                  <div className={styles.axisItem}>
                    <ReactSortable
                      tag={RowWrap}
                      list={axis[type]}
                      setList={(list: any) => {
                        this.setAxis({
                          type,
                          fields: list,
                        });
                      }}
                      onEnd={(evt: SortableEvent) => {
                        const { oldIndex, newIndex, from, to } = evt;
                        console.log("end-f0f-sda");
                        if (from === to && oldIndex === newIndex) {
                          setTimeout(() => {
                            const axis = this.state.axis;
                            const fields = [...axis[type]];
                            fields.splice(oldIndex, 1);
                            this.setAxis({
                              type,
                              fields,
                            });
                          }, 0);
                        }
                      }}
                      group={{
                        name: "field_dimension_group field_measure_group",
                        put: () => {
                          return this.state.axis[type].length < 2;
                        },
                      }}
                    >
                      {axis[type].map((field: any, index) => {
                        return (
                          <Col flex="118px" key={field.field}>
                            <Field
                              type={field.type}
                              {...field}
                              dropdown={field.type === "measure"}
                              onChooseAggr={({ key }: any) =>
                                this.onSetAggr(type, index, key)
                              }
                            />
                          </Col>
                        );
                      })}
                    </ReactSortable>
                  </div>
                </Axis>
              );
            })}
            <div className={styles.inner}>
              <Row>
                <Col flex={1}>
                  <Input
                    onChange={(evt: any) =>
                      this.setState({
                        title: evt.target.value,
                      })
                    }
                    style={{ border: "none" }}
                    value={title}
                  />
                </Col>
                <Col width="120px">
                  <Button onClick={this.doAdd}>添加</Button>
                </Col>
              </Row>
              <Chart config={config} />
            </div>
          </Col>
        </Row>
      );
    }
  }
);
