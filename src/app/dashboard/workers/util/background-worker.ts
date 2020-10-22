import { v4 as uuid } from 'uuid';

export enum WorkerType {
  Xylo = 'xylo',
}

export class BackgroundWorker<I, O> {
  private worker: Worker;
  private promises: Record<string, { resolve: Function, reject: Function }> = {};

  private static newWorker(workerType: WorkerType): Worker {
    return ({
      xylo: new Worker('../xylo.worker.ts', { type: 'module' }),
    })[workerType] || null;
  }

  /**
   * Create a new Worker (web worker) according to the type
   * of work needed to perform.
   */
  constructor(workerType: WorkerType) {
    this.worker = BackgroundWorker.newWorker(workerType);
    this.worker.onmessage = ({ data }) => {
      if (data.success) {
        this.promises[data.uuid].resolve(data.result);
      } else {
        this.promises[data.uuid].reject(data.error);
      }
    };
    this.worker.onerror = (error => { throw error; });
  }

  /**
   * Perform a WorkRequst
   */
  perform(workRequest: I): Promise<O> {
    const promiseId = uuid();
    return new Promise((resolve, reject) => {
      this.promises[promiseId] = { resolve, reject };
      this.worker.postMessage({ workRequest, uuid: promiseId });
    });
  }
}
