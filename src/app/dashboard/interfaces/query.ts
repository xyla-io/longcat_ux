import { TemplateType } from './template';

export type QueryIdentifier = string;

export enum QueryType {
  Cube = 'cube',
}

export interface MetadataQuery {
  templateType: TemplateType.Query;
  queryType: QueryType;
  identifier: QueryIdentifier;
  version: number;
}

export interface CubeQueryParameters {
  interval?: Daterange;
}

export type UnionQueryParameters =
  CubeQueryParameters;

export enum DaterangeUnit {
  Day = 'day',
  Range = 'range',
}

export interface StartEnd {
  start: string;
  end: string;
}

export type DaterangeValue = string|number|StartEnd;

export interface Daterange {
  unit: DaterangeUnit;
  value: DaterangeValue;
}

export interface DisplayableDaterange extends Daterange {
  displayText: string;
}

