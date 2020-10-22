import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Subscription } from 'rxjs';

import { URLProvider } from 'src/app/interfaces/url-provider.interface';
import { ErrorService } from 'src/app/services/alerts/error.service';
import { QueryResultsService, FileFormat } from 'src/app/services/downloads/query-results.service';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service';

export enum RawExportViewType {
  card = 'card',
  dropdown = 'dropdown',
}

export enum WorkState {
  ready,
  working,
  complete,
}

@Component({
  selector: 'app-raw-export',
  templateUrl: './raw-export.component.html',
  styleUrls: ['./raw-export.component.scss']
})
export class RawExportComponent implements OnInit, OnDestroy {
  @Input() urlProvider: URLProvider;
  @Input() resourceKey: string;
  @Input() viewType: RawExportViewType = RawExportViewType.card;
  @Input() pointing: string = 'top right';
  @Input() xOffset: number = 0;
  @Output() startDownloadEvent = new EventEmitter();
  @Output() isLoadingEvent = new EventEmitter();
  @ViewChild('exportButton', {static: false}) exportButton: ElementRef;
  @ViewChild('downloadNameInput', {static: false}) downloadNameInput: ElementRef;
  queryResultsSubscription: Subscription;
  workState: WorkState = WorkState.ready;
  WorkState = WorkState;

  constructor(
    private queryResultsService: QueryResultsService,
    private errorService: ErrorService,
    private userAlertService: UserAlertService,
  ) { }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.queryResultsSubscription) {
      this.queryResultsSubscription.unsubscribe();
    }
  }

  setWorkState(state: WorkState) {
    switch(state) {
      case WorkState.ready:
        this.exportButton.nativeElement.disabled = false;
        break;
      case WorkState.working:
        this.exportButton.nativeElement.disabled = true;
        break;
      case WorkState.complete:
        this.exportButton.nativeElement.disabled = true;
        setTimeout(() => {
          this.setWorkState(WorkState.ready);
        }, 10000);
        break;
    }
    this.workState = state;
  }

  getDefaultDownloadName(): string {
    let addLeadingZero = val => val.length === 1 ? '0' + val : val;
    let formatDate = date => [
      date.getFullYear(),
      addLeadingZero((date.getMonth() + 1).toString()),
      addLeadingZero((date.getDate()).toString()),
    ].join('-');
    return [this.urlProvider.getResourceName(this.resourceKey), formatDate(new Date())].join('_');
  }

  getDownloadName(extension: string): string {
    let downloadName = '';
    if (this.downloadNameInput.nativeElement.value) {
      downloadName = this.downloadNameInput.nativeElement.value;
    } else {
      downloadName = this.getDefaultDownloadName();
    }
    if (!downloadName.endsWith(extension)) { downloadName += extension; }
  return downloadName;
}

  focusDownloadNameInput(event) {
    setTimeout(() => this.downloadNameInput.nativeElement.focus(), 0);
  }

  async clickDownloadButton(event: any) {
    if (this.workState !== WorkState.ready) { return; }
    this.isLoadingEvent.emit(true);
    this.setWorkState(WorkState.working);
    try {
      const url = await this.urlProvider.getURL(this.resourceKey);
      if (!url) { throw new Error(); }
      this.queryResultsService.startDownload({
        url: url,
        fileName: this.getDownloadName('.csv'),
        fileFormat: FileFormat.Uncompressed,
        displayName: this.urlProvider.getDisplayName(this.resourceKey),
      });
      this.startDownloadEvent.emit(true);
    } catch (error) {
      console.error(error);
      this.userAlertService.postAlert({
        alertType: UserAlertType.error,
        header: 'Unable to download file',
        body: 'There was a problem getting the file you requested',
        autoCloseSeconds: 7,
      });
    }
    this.isLoadingEvent.emit(false);
    this.setWorkState(WorkState.ready);
  }
}
