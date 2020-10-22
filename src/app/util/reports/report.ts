import * as Papa from 'papaparse';

export class Report {
  static readonly channelColumnName = 'channel';
  resultData: any[];
  rows: any[] = [];
  columnNames: string[];

  constructor() {}

  addCSVFromURL(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            this.processResults(results);
            resolve();
          } catch (e) {
            reject(e);
          }
        },
      })
    });
  }

  addCSV(csv: string, ..._: any[]) {
    const results = Papa.parse(csv, {
      skipEmptyLines: true,
    });
    this.processResults(results);
  }

  private processResults(results) {
    if (results.errors && results.errors.length) { throw new Error(JSON.stringify(results.errors)); }
    this.columnNames = results.data.shift();
    this.resultData = results.data;
    this.applyRows();
  }

  protected applyRows() {
    this.rows.push(...this.resultData);
  }
}