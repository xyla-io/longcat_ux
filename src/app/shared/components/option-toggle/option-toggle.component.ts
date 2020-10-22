import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-option-toggle',
  templateUrl: './option-toggle.component.html',
  styleUrls: ['./option-toggle.component.scss']
})
export class OptionToggleComponent implements OnInit {

  @Input() option: boolean;
  @Input() color: string = '';
  @Input() knobColor: string = '';
  @Input() useToggle = false;
  @Output() toggleChange = new EventEmitter();


  constructor() { }

  ngOnInit() {
  }

  async onToggleChange(event: MouseEvent, checked: boolean) {
    event.stopPropagation();
    this.toggleChange.emit(checked);
  }

}
