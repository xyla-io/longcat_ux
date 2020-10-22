import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-partner-welcome',
  templateUrl: './partner-welcome.component.html',
  styleUrls: ['./partner-welcome.component.css']
})
export class PartnerWelcomeComponent implements OnInit {

  partnerDisplayName: string = '';

  constructor() { }

  ngOnInit() {
  }
}
