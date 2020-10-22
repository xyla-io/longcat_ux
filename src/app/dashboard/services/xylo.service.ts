import { Injectable } from '@angular/core';
import { XylaEmbed } from 'src/app/services/api/embeds.service';
import { WorkerType, BackgroundWorker } from 'src/app/dashboard/workers/util/background-worker';
import { XyloWork, ColumnWork, TableWork, DistinctValuesWork } from 'src/app/dashboard/workers/xylo-work-request';
import { ModelTreeGrid } from 'src/app/dashboard/workers/util/aggregation';

@Injectable({
  providedIn: 'root'
})
export class XyloService {

  worker = new BackgroundWorker<XyloWork, any>(WorkerType.Xylo);

  constructor() { }

  async fetchData(xylaEmbed: XylaEmbed): Promise<{dataSetKey: string, url: string}> {
    return await this.worker.perform({
      dataSetKey: xylaEmbed.path,
      url: xylaEmbed.signedURL,
    });
  }

  async aggregateColumn(columnWork: ColumnWork): Promise<number> {
    return await this.worker.perform(columnWork);
  }

  async aggregateTable(tableWork: TableWork): Promise<ModelTreeGrid> {
    return await this.worker.perform(tableWork);
  }

  async getDistinctValues(distinctValuesWork: DistinctValuesWork): Promise<(string|number)[]> {
    return await this.worker.perform(distinctValuesWork);
  }

}
