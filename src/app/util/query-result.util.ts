interface QueryResult {
  row_count: number;
  column_names?: string[];
  rows?: any[];
}

export class QueryResultUtil {

  static filterRowsWithEmptyColumn<T extends QueryResult>(queryResult: T, columnName: string): T {
    if (!queryResult.row_count) { return queryResult; }
    const colIndex = queryResult.column_names.findIndex(name => name === columnName);
    if (colIndex > -1) {
      queryResult.rows = queryResult.rows.filter(row => row[colIndex]);
    }
    return queryResult;
  }

  static replaceEmptyValuesInColumn<T extends QueryResult>(queryResult: T, columnName: string, replacementValue: string): T {
    if (!queryResult.row_count) { return queryResult; }
    const colIndex = queryResult.column_names.findIndex(name => name === columnName);
    if (colIndex > -1) {
      queryResult.rows.forEach(row => {
        if (!row[colIndex]) {
          row[colIndex] = replacementValue;
        }
      });
    }
    return queryResult;
  }

}
