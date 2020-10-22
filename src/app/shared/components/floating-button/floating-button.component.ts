import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-floating-button',
  templateUrl: './floating-button.component.html',
  styleUrls: ['./floating-button.component.scss']
})
export class FloatingButtonComponent implements OnInit {
  @Input() label = '';
  @Input() icon = 'settings-outline';
  @Input() collapsed = false;
  @Input() collapsedIcon;
  @Input() collapsedLabel;
  @Output() itemClick = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  onClick(event: any) {
    this.itemClick.emit();
  }

}
