import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-submit-button',
  templateUrl: './submit-button.component.html',
  styleUrls: ['./submit-button.component.css']
})
export class SubmitButtonComponent implements OnInit {
  @Input() label: string;
  @Input() isEnabled: boolean = true;
  @Input() isWaiting: boolean = false;
  @Output() onClick = new EventEmitter<any>();

  constructor() { }

  ngOnInit() { }

  onClickButton(event) {
    this.onClick.emit(event);
  }
}
