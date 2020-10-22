/// <reference lib="webworker" />
import {
  Model,
  DataSet,
} from 'development_packages/xylo/index';
import {
  isXyloWork,
  isColumnWork,
  ColumnWork,
  isTableWork,
  TableWork,
  FetchWork,
  isFetchWork,
  DistinctValuesWork,
  isDistinctValuesWork,
} from './xylo-work-request';
import {
  AggregationOps
} from './util/aggregation';
import { ModelTreeGrid } from 'src/app/dashboard/workers/util/aggregation';

importScripts('dataframe.min.js');
addEventListener('message', doWork);

const xyloModel = new Model();

function throwBadRequest(uuid) {
  throw new Error(`Unknown work request (${uuid}) for aggregation.worker`);
}

async function doWork({ data }) {
  const { workRequest, uuid } = data;
  if (!isXyloWork(workRequest)) { throwBadRequest(uuid); }
  if (isFetchWork(workRequest)) { return doFetchWork(uuid, workRequest); }
  const dataSet = await xyloModel.getDataSet(workRequest.dataSetKey);
  if (isColumnWork(workRequest)) { return doColumnWork(uuid, dataSet, workRequest); }
  if (isTableWork(workRequest)) { return doTableWork(uuid, dataSet, workRequest); }
  if (isDistinctValuesWork(workRequest)) { return doDistinctValuesWork(uuid, dataSet, workRequest); }
  throwBadRequest(uuid);
}

function doFetchWork(uuid: string, fetchWork: FetchWork) {
  xyloModel.fetchDataSet(fetchWork.dataSetKey, fetchWork.url);
  postMessage({
    uuid,
    success: true,
    result: {
      dataSetKey: fetchWork.dataSetKey,
      url: fetchWork.url
    }
  });
}

function doColumnWork(uuid: string, dataSet: DataSet, columnWork: ColumnWork) {
  const result: number = AggregationOps.aggregateColumn(
    dataSet,
    columnWork.templateColumn,
    columnWork.rowFilters,
  );
  postMessage({
    uuid,
    success: true,
    result
  });
}

function doTableWork(uuid: string, dataSet: DataSet, tableWork: TableWork) {
  const result: ModelTreeGrid = AggregationOps.aggregateTable(
    dataSet,
    tableWork.displayColumns,
    tableWork.displayBreakdownIdentifiers,
    tableWork.templateColumnMap,
    tableWork.templateBreakdownMap,
    tableWork.rowFilters
  );
  postMessage({
    uuid,
    success: true,
    result
  });
}

function doDistinctValuesWork(uuid: string, dataSet: DataSet, distinctValuesWork: DistinctValuesWork) {
  const result: (string|number)[] = AggregationOps.getDistinctValues(dataSet, distinctValuesWork.distinctValuesColumn);
  postMessage({
    uuid,
    success: true,
    result
  });
}

