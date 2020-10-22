import { Report } from "./report";
export interface ObjectReportOptions {
  jsonColumns?: Record<string, { prefix: string }>;
  urlFieldColumns?: ['channel'];
}
export class ObjectReport extends Report {
  constructor(protected options: ObjectReportOptions) {
    super();
  }

  static pathComponentsFromRowUrl(rowUrl: string) {
    const [rowType, path] = rowUrl.split('://');
    return path.split('/');
  }

  protected applyRows() {
    const { jsonColumns } = this.options;
    this.rows = this.rows.concat(this.resultData.map((row: string[]) => {
      return row.reduce((record, val, i) => {
        const columnName = this.columnNames[i];
        if (jsonColumns && jsonColumns[columnName]) {
          const { prefix } = jsonColumns[columnName];
          Object.entries(JSON.parse(val)).forEach(([k, v]) => {
            record[`${prefix}${k}`] = v;
          })
        } {
          record[columnName] = val;
        }
        if (this.options.urlFieldColumns && record.url) {
          const urlFields = ObjectReport.pathComponentsFromRowUrl(record.url);
          this.options.urlFieldColumns.forEach((columnName, i) => {
            if (columnName && urlFields[i]) { record[columnName] = urlFields[i]; }
          });
        }
        return record;
      }, {} as any);
    }));
  }
}