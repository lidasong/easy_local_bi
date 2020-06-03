import { message } from "antd";
import { nav } from "./default";
declare global {
  interface Window {
    openDatabase: any;
    database: any;
  }
}

export const DEFAULT_OPTIONS = {
  dbName: "my_db_1.0",
  tbName: "my_table_field",
  nav: "my_nav_setting",
  pages: "my_pages",
};

class Database {
  name: string;
  options: any;
  db: any;
  static create(name: string, options?: any) {
    return new Database(name, options);
  }
  constructor(name: string, options?: any) {
    if (!name) {
      message.error("创建database时，名称必填");
      throw "database name should be not null";
    }
    this.name = name;
    this.options = {
      version: "1.0",
      ...options,
    };
    const { version, desc, size, callback } = this.options;
    this.db = window.openDatabase(name, version, desc, size, callback);
  }
  transaction(fn: (tx: any) => any, options?: any) {
    const { readOnly } = options || {};
    this.db[readOnly ? "readTransaction" : "transaction"](fn);
  }
  createTable(table: string, fields: string[]) {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${table} (${fields.join(",")})`,
          [],
          () => resolve(true),
          () => reject(new Error("create table got errors"))
        );
      });
    });
  }
  query(sql: string) {
    return new Promise((resolve, reject) => {
      this.db.readTransaction((tx) => {
        tx.executeSql(
          sql,
          [],
          (_, result) => {
            resolve([].slice.call(result.rows || []));
          },
          () => reject(new Error("the query got error"))
        );
      });
    });
  }
  insert(table: string, values: any[]) {
    values = Array.isArray(values[0]) ? values : [values];
    values = values.map((value) => {
      return `(${value
        .map((item) => {
          if (typeof item === "string") {
            item = `\"${item}\"`;
          }
          return item;
        })
        .join(",")})`;
    });
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          `insert into ${table} values ${values.join(",")}`,
          [],
          () => resolve(true),
          () => reject(new Error("insert to table find errors"))
        );
      });
    });
  }

  update(table: string, columns: any, where: any = "1=1") {
    const set = Object.keys(columns)
      .map((key: string) => {
        return `${key} = ` + JSON.stringify(columns[key]);
      })
      .join(",");
    if (typeof where === "object") {
      where = Object.keys(where)
        .map((key: string) => {
          return `${key} = ` + JSON.stringify(where[key]);
        })
        .join(" and ");
    }
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          `update ${table} set ${set} where ${where}`,
          [],
          () => resolve(true),
          () => reject(new Error("update find errors"))
        );
      });
    });
  }

  del(table: string, where: any) {
    if (typeof where === "object") {
      where = Object.keys(where)
        .map((key: string) => {
          return `${key} = ` + JSON.stringify(where[key]);
        })
        .join(" and ");
    }
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          `delete from ${table} where ${where}`,
          [],
          () => resolve(true),
          () => reject(new Error("update find errors"))
        );
      });
    });
  }

  drop(tbName: string) {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          `drop table ${tbName}`,
          [],
          () => {
            resolve(true);
          },
          () => {
            reject(new Error("failed drop the table"));
          }
        );
      });
    });
  }
  async clear() {
    Object.keys(DEFAULT_OPTIONS).forEach(async (key: string) => {
      if (key !== "dbName") {
        const name = DEFAULT_OPTIONS[key];
        if (key === "tbName") {
          const tables = (await database.query(
            `select distinct tb_name from  ${name}`
          )) as any[];
          (tables || []).forEach((table: any) => {
            database.drop(table.tb_name);
          });
        }
        database.drop(name);
      }
    });
    localStorage.removeItem("nav_has_setted");
  }
}

export default Database;

export const database = (window.database = Database.create(
  DEFAULT_OPTIONS.dbName
));

(async () => {
  try {
    const isSetted = localStorage.getItem("nav_has_setted");
    if (!isSetted) {
      localStorage.setItem("nav_has_setted", "true");
      database.createTable(DEFAULT_OPTIONS.tbName, [
        "tb_name",
        "field",
        "type",
      ]);

      database.createTable(DEFAULT_OPTIONS.nav, ["top", "left"]);

      database.insert(DEFAULT_OPTIONS.nav, [
        encodeURIComponent(JSON.stringify(nav.top)),
        encodeURIComponent(JSON.stringify(nav.left)),
      ]);
    }
  } catch (err) {
    console.error("error", err);
  }
})();
