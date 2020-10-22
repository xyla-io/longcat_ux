import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-button-circular',
  templateUrl: './button-circular.component.html',
  styleUrls: ['./button-circular.component.scss']
})
export class ButtonCircularComponent implements OnInit {
  @Input() tooltip;
  @Input() color;
  @Input() icon;

  constructor() { }

  ngOnInit() {
  }

}
