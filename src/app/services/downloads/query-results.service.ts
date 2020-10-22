import { Injectable } from '@angular/core';
import { Subject, Observable, of, from } from 'rxjs';
import { switchMap, share } from 'rxjs/operators';
import pako from 'pako';
// Tell TypeScript about the TextDecoder object
declare var TextDecoder: any;

export interface QueryResultsDownload {
  url: string;
  displayName: string;
  fileName: string;
  fileFormat: FileFormat;
  progress?: number;
  totalBytes?: number;
  downloadedBytes?: number;
}

export interface CompleteDownload {
  fileName: string;
  data: string;
}

export enum FileFormat {
  Uncompressed,
  Gzip,
}

@Injectable({
  providedIn: 'root'
})
export class QueryResultsService {
  private static readonly chunkSize = 1000000;

  private downloadsMap: Map<string, QueryResultsDownload> = new Map();
  private inflatorMap: Map<string, any> = new Map();
  private uncompressedBytesMap: Map<string, string[]> = new Map();
  private downloadsLoader: Subject<{ shouldLoad: boolean, completeDownload: CompleteDownload }>;
  private _downloadsObservable: Observable<{ status: QueryResultsDownload[], completeDownload: CompleteDownload }>;

  constructor() {
    this.downloadsLoader = new Subject<{ shouldLoad: boolean, completeDownload: CompleteDownload }>();
    this._downloadsObservable = this.downloadsLoader.pipe(switchMap((args, index) => {
      if (!args.shouldLoad) { return of (null); }
      const results: QueryResultsDownload[] = [];
      this.downloadsMap.forEach(result => results.push(result));
      return of({
        status: results.reverse(),
        completeDownload: args.completeDownload,
      });
    })).pipe(share());
  }

  get downloadsObservable(): Observable<{ status: QueryResultsDownload[], completeDownload: CompleteDownload }> {
    return this._downloadsObservable;
  }

  startDownload(download: QueryResultsDownload) {
    if (this.downloadsMap.has(download.url)) { return; }
    download.progress = 0;
    this.downloadsMap.set(download.url, download);
    switch (download.fileFormat) {
      case FileFormat.Gzip:
        this.inflatorMap.set(download.url, new pako.Inflate());
        break;
      case FileFormat.Uncompressed:
      default:
        this.uncompressedBytesMap.set(download.url, []);
        break;
    }
    this.refreshDownloadsStatus();
    this.fetchChunk(download, 0, QueryResultsService.chunkSize);
  }

  private fetchChunk(download: QueryResultsDownload, start: number, size: number) {
    const headers = new Headers();
    switch (download.fileFormat) {
      case FileFormat.Gzip:
        headers.append('Range', `bytes=${start}-${start + size - 1}`);
        break;
      case FileFormat.Uncompressed:
      default:
        break;
    }

    fetch(download.url, {
      headers,
    }).then(response => {

      const updateProgress = () => {
        download.progress = Math.round(download.downloadedBytes / download.totalBytes * 100);
        this.refreshDownloadsStatus();
      };

      let promise;
      switch (download.fileFormat) {
        case FileFormat.Gzip:
          const contentRange = response.headers.get('Content-Range');
          const [range, total] = contentRange.split(' ')[1].split('/');
          const [rangeStart, rangeEnd] = range.split('-');
          download.totalBytes = +total;
          download.downloadedBytes = +rangeEnd + 1;
          updateProgress();
          promise = response.arrayBuffer();
          break;
        case FileFormat.Uncompressed:
        default:
          download.totalBytes = +(response.headers.get('Content-Length'));
          download.downloadedBytes = download.totalBytes;
          updateProgress();
          promise = response.text();
      }
      return promise;
    }).then((data: ArrayBuffer|string) => {
      if (typeof data === 'string') {
        const uncompressedBytes = this.uncompressedBytesMap.get(download.url);
        uncompressedBytes.push(data);
      } else {
        const bytes = new Uint8Array(data);
        const inflator = this.inflatorMap.get(download.url);
        inflator.push(bytes, false);
      }
      if (download.downloadedBytes < download.totalBytes) {
        this.fetchChunk(download, download.downloadedBytes, QueryResultsService.chunkSize);
      } else {
        this.downloadComplete(download);
      }
    });
  }

  private downloadComplete(download: QueryResultsDownload) {
    let result;
    switch (download.fileFormat) {
      case FileFormat.Gzip:
        const inflator = this.inflatorMap.get(download.url);
        inflator.push([], true);
        result = inflator.result;
        break;
      case FileFormat.Uncompressed:
      default:
        const uncompressedBytes = this.uncompressedBytesMap.get(download.url);
        result = uncompressedBytes.join('');
        break;
    }

    this.downloadsLoader.next({
      shouldLoad: true,
      completeDownload: {
        fileName: download.fileName,
        data: result,
      }
    });
    this.inflatorMap.delete(download.url);
    setTimeout(() => {
      this.downloadsMap.delete(download.url);
      this.refreshDownloadsStatus();
    }, 5000);
  }

  private refreshDownloadsStatus() {
    this.downloadsLoader.next({shouldLoad: true, completeDownload: null});
  }
}
