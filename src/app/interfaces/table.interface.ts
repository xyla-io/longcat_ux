export interface ColumnTemplate {
  name: string;
  header: string;
  data_columns: string[];
  sort_column: string;
  view: {};
}

export interface TableCell {
  values: {};
}

export interface TableRow {
  index: number;
  values: {};
  isSelected: boolean;
}

export enum SelectionState {
  NONE,
  SOME,
  ALL,
}

export interface RowProvider {
  getAllRows(): TableRow[];
  getAvailableRows(): TableRow[];
}
