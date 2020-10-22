import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-message-presenter',
  templateUrl: './message-presenter.component.html',
  styleUrls: ['./message-presenter.component.css']
})
export class MessagePresenterComponent implements OnInit {
  @Input() errors: string[] = [];
  @Input() results: string[] = [];

  constructor() {
  }

  ngOnInit() {
  }

}
