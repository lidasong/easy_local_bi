import React, { useState, useEffect } from "react";
import { Upload, message, Table, Row, Col } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import Parser from "../../excel";
import { database, DEFAULT_OPTIONS } from "../../databases";
import { isDate, getDataType } from "../../utils";

const { Dragger } = Upload;

const setProps = (setSheets: any) => ({
  name: "file",
  accept: ".xls,.xlsx",
  showUploadList: false,
  customRequest() {
    message.info("数据已创建成功，请新建页面，制作报表");
  },
  beforeUpload(file: File) {
    const parser = new Parser();
    return parser.parse(file).then((sheets: any[]) => {
      return Promise.all(
        sheets.map((sheet) => {
          return new Promise(async (resolve, reject) => {
            const { table, rows } = sheet;
            let fields = rows[0];
            fields = fields.map((field: string) => {
              if (typeof field === "string") {
                field = field.replace(/[-^/|]/g, "_");
              }
              return field;
            });
            try {
              await database.insert(
                DEFAULT_OPTIONS.tbName,
                (rows[1] || []).map((field: any, index: number) => {
                  return [
                    table,
                    fields[index],
                    getDataType(field).toLowerCase(),
                  ];
                })
              );
              await database.createTable(table, fields);
              const dataSource = rows.slice(1).map((row: any) => {
                return row.map((item: any) => {
                  if (typeof item === "string") {
                    item = item.replace(/[-^/|]/g, "_");
                  }
                  if (isDate(item)) {
                    item = item.toISOString().replace(/T|(\.\d{3}Z)/g, " ");
                  }
                  return item;
                });
              });
              await database.insert(table, dataSource);
              resolve({
                table,
                columns: fields,
                dataSource,
              });
            } catch (err) {
              reject(err);
            }
          });
        })
      ).then((...tables: any) => {
        tables = tables[0];
        setSheets &&
          setSheets(
            tables.map((table: any) => {
              const { table: name, columns = [], dataSource = [] } = table;
              return {
                table: name,
                columns: columns.map((column: any) => ({
                  title: column,
                  dataIndex: column,
                })),
                dataSource: (dataSource || [])
                  .slice(0, 100)
                  .map((item: any) => {
                    return item.reduce(
                      (result: any, data: any, index: number) => {
                        result[columns[index]] = data;
                        return result;
                      },
                      {}
                    );
                  }),
              };
            })
          );
        return tables;
      });
    });
  },
  onChange(info) {
    const { status } = info.file;
    if (status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
});

export default () => {
  const [sheets, setSheets] = useState([]);
  const [current, setCur] = useState({} as any);
  const { table = "", columns = [], dataSource = [] } = current || {};
  useEffect(() => {
    setCur(sheets[0]);
  }, [sheets]);
  const changeSheet = (sheet: any) => {
    setCur(sheet);
  };
  return (
    <>
      <Dragger {...setProps(setSheets)}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">拖拽或点击加载需要使用的excel数据源</p>
        <p className="ant-upload-hint">
          目前只支持excel文件上传，可以多sheets。完全本地化，数据源不会同步远端
        </p>
      </Dragger>
      {table && (
        <Table
          scroll={{ y: 400 }}
          key={table}
          columns={columns}
          dataSource={dataSource}
          footer={() => (
            <Row>
              {sheets.map((sheet: any) => {
                return (
                  <Col key={sheet.table} style={{ paddingLeft: "12px" }}>
                    <a onClick={() => changeSheet(sheet)}>{sheet.table}</a>
                  </Col>
                );
              })}
            </Row>
          )}
        ></Table>
      )}
    </>
  );
};
