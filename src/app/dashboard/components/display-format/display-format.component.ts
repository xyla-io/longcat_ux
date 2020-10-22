import { Component, OnInit, Input } from '@angular/core';
import { DisplayFormat } from 'src/app/dashboard/interfaces/column';

@Component({
  selector: 'app-display-format',
  templateUrl: './display-format.component.html',
  styleUrls: ['./display-format.component.css']
})
export class DisplayFormatComponent implements OnInit {
  // Used in the template
  DisplayFormat = DisplayFormat;

  @Input() format: DisplayFormat;
  @Input() value: string|number;
  @Input() displayNullAs: string|number = '—';

  constructor() { }

  ngOnInit() {
  }

}
