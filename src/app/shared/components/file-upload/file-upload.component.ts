import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';

import { DataFeedsAlertService } from 'src/app/services/alerts/data-feeds-alert.service';

export interface UploadOption {
  actionKey: string;
  buttonText: string;
  tooltip: string;
  confirmationPrompt?: string;
  iconTag: string;
}

export interface FileInputEvent {
  actionKey: string;
  data: Blob;
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  @Output() fileInputEvent = new EventEmitter<FileInputEvent>();
  @Input('tooltip') tooltip: string = 'Upload';
  @Input() iconTag: string = 'blue upload';
  @Input() header: string = 'Upload File';
  @Input() isWaiting: boolean = false;
  @Input() uploadOptions: UploadOption[] = [];
  @ViewChildren('optionFileInputs') optionFileInputs: QueryList<ElementRef>;

  constructor(
    private dataFeedsAlertService: DataFeedsAlertService,
  ) { }

  ngOnInit() {
  }

  inputFileChangedForOption(event: any, i: number, option?: UploadOption) {
    if (this.isWaiting) { return; }
    let input = this.getFileInputForOptionIndex(i);
    let fileData = input.nativeElement.files[0];
    input.nativeElement.value = "";
    if (!fileData) { return; }

    if (option && option.confirmationPrompt) {
      let confirmation = confirm(option.confirmationPrompt);
      console.log(confirmation);
      if (!confirmation) {
        this.dataFeedsAlertService.postReplaceUploadCancelledAlert();
        return;
      }
    }

    this.fileInputEvent.emit({
      actionKey: option ? option.actionKey : 'upload',
      data: fileData,
    });
  }

  clickButtonForOptionIndex(event: any, i: number) {
    let input = this.getFileInputForOptionIndex(i);
    input.nativeElement.click();
  }

  private getFileInputForOptionIndex(i: number): ElementRef {
    return this.optionFileInputs.toArray()[i];
  }
}
