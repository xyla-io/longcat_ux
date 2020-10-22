export enum ColumnFlagEnum {
  JSON = 'json',
  Category = 'category',
  Metric = 'metric',
  Property = 'property',
  Time = 'time',
}

export class PerformanceColumnOps {

  static columnFlagDelimiter = '#';
  static columnGroupDelimiter = '@';
  static columnGroupRegex = /^([^@]*)@(.*)/;

  static columnIsFlagged(fullColumnName: string, flag: ColumnFlagEnum) {
    return fullColumnName.startsWith(`${flag}${PerformanceColumnOps.columnFlagDelimiter}`);
  }

  static addFlag(columnName: string, flag: ColumnFlagEnum) {
    return `${flag}${PerformanceColumnOps.columnFlagDelimiter}${columnName}`;
  }

  static removeFlag(fullColumnName: string, flag: ColumnFlagEnum) {
    return fullColumnName.replace(`${flag}${PerformanceColumnOps.columnFlagDelimiter}`, '');
  }

  static removeFlags(fullColumnName: string) {
    return fullColumnName.split(this.columnFlagDelimiter).slice(-1)[0];
  }

  static filterColumnNames(columnNames: string[] = [], flag: ColumnFlagEnum) {
    return columnNames.filter(column => PerformanceColumnOps.columnIsFlagged(column, flag));
  }

  static getColumnGroup(fullColumnName: string) {
    const matches = PerformanceColumnOps.columnGroupRegex.exec(fullColumnName);
    if (!matches) { return null; }
    const [ , columnGroup, columnName] = matches;
    return {
      columnGroup,
      columnName,
    };
  }

  static convertColumnValue(columnName: string, value: string) {
    if (value === '') { return 'Other'; }
    return PerformanceColumnOps.columnIsFlagged(columnName, ColumnFlagEnum.Metric)
      ? parseFloat(value)
      : value;
  }
}