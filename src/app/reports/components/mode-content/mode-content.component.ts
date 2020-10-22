import {
  Component,
  OnInit,
  Input
} from '@angular/core';
import { ReportElement } from 'src/app/services/api/report-element.service';
import { ModeContent } from 'src/app/services/api/company-reports.service';
import { MessageService } from 'src/app/services/app/message.service';

export interface ModeElement extends ReportElement {
  content: ModeContent;
}

@Component({
  selector: 'app-mode-content',
  templateUrl: './mode-content.component.html',
  styleUrls: ['./mode-content.component.css']
})
export class ModeContentComponent implements OnInit {
  @Input() element: ModeElement;

  constructor(
    private messageService: MessageService,
  ) { }

  ngOnInit() { } 

  clickIframe() { this.messageService.sendMessage('iframeClick', 'ModeContentComponent'); }
}
