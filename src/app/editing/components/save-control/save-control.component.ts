import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

export interface SaveStateDelegate {
  saveStatus: SaveStatus;
  updateSaveState: (update: any) => void;
};

export enum SaveStatus {
  New = 'new',
  Clean = 'clean',
  Dirty = 'dirty',
};

export interface SaveControlTextOptions {
  saveText: string;
  cancelText: string;
  deleteText: string;
  cleanText: string;
  titlePlaceholder: string;
  deleteIcon: string;
};

@Component({
  selector: 'app-save-control',
  templateUrl: './save-control.component.html',
  styleUrls: ['./save-control.component.scss']
})
export class SaveControlComponent implements OnInit, OnChanges {
  SaveStatus = SaveStatus;

  @Input() textOptions: Partial<SaveControlTextOptions> = {};
  @Input() newTextOptions: Partial<SaveControlTextOptions> = {};
  @Input() cleanTextOptions: Partial<SaveControlTextOptions> = {};
  @Input() dirtyTextOptions: Partial<SaveControlTextOptions> = {};
  @Input() saveStatus: SaveStatus = SaveStatus.New;
  @Input() title: string = '';
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output('title') titleChange = new EventEmitter<string>();

  currentTextOptions: SaveControlTextOptions = {
    saveText: '',
    cancelText: '',
    deleteText: '',
    cleanText: '',
    titlePlaceholder: '',
    deleteIcon: '',
  }

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    Object.assign(this.currentTextOptions, this.textOptions);
    switch (this.saveStatus) {
      case SaveStatus.New:
        Object.assign(this.currentTextOptions, this.newTextOptions);
        break;
      case SaveStatus.Clean:
        Object.assign(this.currentTextOptions, this.cleanTextOptions);
        break;
      case SaveStatus.Dirty:
        Object.assign(this.currentTextOptions, this.dirtyTextOptions);
        break;
    }
  }

  onClickSave(event: any) {
    this.save.emit();
  }

  onClickCancel(event: any) {
    this.cancel.emit();
  }

  onClickDelete(event: any) {
    this.delete.emit();
  }

  onTitleChange(event: any) {
    this.title = event.target.value;
    this.titleChange.emit(this.title);
  }

}
