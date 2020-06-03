import Excel from "exceljs";

declare global {
  interface Window {
    workbook: any;
  }
}
export default class Parser {
  parse(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = function (event) {
        const arrayBuffer = reader.result as Buffer;
        const workbook = new Excel.Workbook();
        window.workbook = workbook;
        workbook.xlsx
          .load(arrayBuffer)
          .then(function (workbook) {
            const sheets = [];
            workbook.worksheets.forEach((sheet, index) => {
              sheets[index] = {
                table: sheet.name,
                rows: [],
              };
              const rows = sheets[index].rows;
              sheet.eachRow((row: any) => {
                rows.push(row.values.slice(1));
              });
            });
            return sheets;
          })
          .then((sheets: any[]) => {
            resolve(sheets);
          })
          .catch((err) => {
            reject(err);
          });
      };
      reader.readAsArrayBuffer(file);
    });
  }
}
