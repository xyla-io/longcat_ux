import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

export interface BankedButton {
  identifier: string;
  displayName: string;
  disabled: boolean;
  tooltip?: string;
}

@Component({
  selector: 'app-button-bank',
  templateUrl: './button-bank.component.html',
  styleUrls: ['./button-bank.component.scss']
})
export class ButtonBankComponent implements OnInit {

  @Input() buttons: BankedButton[];
  @Output() buttonClick = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  onButtonClick(identifier: string) {
    this.buttonClick.emit(identifier);
  }

}
