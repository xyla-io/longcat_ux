import { TableRow } from './table.interface';

export interface FilterDataProvider {
  presetFilterMap: {[x: string]: PresetFilter};
  defaultFilterKey: string;
  orderedFilterKeys: string[];
}

export interface PresetFilter {
  key: string;
  displayName: string;
  apply: (rows: TableRow[]) => TableRow[];
}
