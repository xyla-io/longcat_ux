import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { OptionConfig, Options } from '../../../iomap/util/options';
import { WindowRef } from 'src/app/services/app/window.service';
import { UICollapsible } from '../../base-components/ui-collapsible.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

export interface OrderedSelectionChange {
  selections: string[];
}

@Component({
  selector: 'app-option-ordered-multi-select',
  templateUrl: './option-ordered-multi-select.component.html',
  styleUrls: ['./option-ordered-multi-select.component.scss', '../../styles/option-multi-select.shared.scss'],
})
export class OptionOrderedMultiSelectComponent extends UICollapsible implements OnInit, OnChanges, OnDestroy {

  @Input() selections: string[] = [];
  @Input() options: Record<string, OptionConfig<any>>;
  @Input() placeholder?: string = 'Options';
  @Input() icon?: string = 'cog'; // Semantic icon class
  @Output() selectionChange = new EventEmitter<OrderedSelectionChange>();

  displayableOptions: OptionConfig<any>[] = [];
  selectedOptions: OptionConfig<any>[] = [];
  unselectedOptions: OptionConfig<any>[] = [];

  constructor(
    window: WindowRef,
    changeDetector: ChangeDetectorRef,
  ) {
    super(window, changeDetector);
  }

  ngOnInit() {
    super.ngOnInit();
    this.uiCollapsibleConfig.collapseOnWindowClick = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.displayableOptions = [];
    this.selectedOptions = [];
    this.unselectedOptions = [];
    this.displayableOptions = Options.values(this.options) as OptionConfig<any>[];

    if (this.selections) {
      this.selections.forEach(selection => {
        const option = this.displayableOptions.find(o => o.key === selection);
        if (option) {
          this.selectedOptions.push(option);
        }
      });
    }

    this.displayableOptions.forEach(option => {
      let selected;
      selected = this.selections.includes(option.key);
      if ((option as any).displayInverted) {
        selected = !selected;
      }
      if (!selected) {
        this.unselectedOptions.push(option);
      }
    })
  }

  onClickRemove(event, option: OptionConfig<any>) {
    this.selectedOptions.splice(this.selectedOptions.findIndex(o => o.key === option.key), 1);
    this.selectionChange.emit({ selections: this.selectedOptions.map(o => o.key) });
  }

  onClickAdd(event, option: OptionConfig<any>) {
    this.selectedOptions.push(option);
    this.selectionChange.emit({ selections: this.selectedOptions.map(o => o.key) });
  }

  onClickLiner(event) {
    this.isOpen = !this.isOpen;
    event.stopPropagation();
  }

  onDropReorder(event: CdkDragDrop<string[]>) {
    if (event.previousIndex === event.currentIndex) { return; }
    moveItemInArray(this.selectedOptions, event.previousIndex, event.currentIndex);
    this.selectionChange.emit({ selections: this.selectedOptions.map(o => o.key) })
  }
}
