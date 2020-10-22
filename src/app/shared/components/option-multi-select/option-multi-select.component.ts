import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { OptionConfig, Options } from '../../../iomap/util/options';
import { ChannelEnum } from 'src/app/iomap/models/channel';
import { WindowRef } from 'src/app/services/app/window.service';
import { UICollapsible } from '../../base-components/ui-collapsible.component';

export interface SelectionChange<T> {
  option: OptionConfig<T>;
  value: boolean;
}

@Component({
  selector: 'app-option-multi-select',
  templateUrl: './option-multi-select.component.html',
  styleUrls: ['./option-multi-select.component.scss', '../../styles/option-multi-select.shared.scss'],
})
export class OptionMultiSelectComponent extends UICollapsible implements OnInit, OnChanges {

  @Input() model: { channel: ChannelEnum };
  @Input() options: Record<string, OptionConfig<any>>;
  @Input() placeholder?: string = 'Options';
  @Input() icon?: string = 'cog'; // Semantic icon class
  @Input() noShadow?: boolean = false;
  @Output() selectionChange = new EventEmitter<SelectionChange<any>[]>();

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
    this.displayableOptions = Options.values(this.options,
      { channel: this.model.channel, },
    ) as OptionConfig<any>[];

    this.displayableOptions.forEach(option => {
      let selected;
      if (typeof (option as any).get === 'function') {
        selected = !!(option as any).get(this.model);
      } else {
        selected = !!this.model[option.key];
      }
      if ((option as any).displayInverted) {
        selected = !selected;
      }
      if (selected) {
        this.selectedOptions.push(option);
      } else {
        this.unselectedOptions.push(option);
      }
    })
  }

  onClickRemove(event, option: OptionConfig<any>) {
    this.selectionChange.emit([{ option, value: !!(option as any).displayInverted }]);
  }

  onClickAdd(event, option: OptionConfig<any>) {
    this.selectionChange.emit([{ option, value: !(option as any).displayInverted }]);
  }

  onClickLiner(event: MouseEvent) {
    this.isOpen = !this.isOpen;
    event.stopPropagation();
  }
}
