import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { ReportElement } from 'src/app/services/api/report-element.service';
import { PeriscopeContent } from 'src/app/services/api/company-reports.service';
import { MessageService } from 'src/app/services/app/message.service';

export interface PeriscopeElement extends ReportElement {
  content: PeriscopeContent;
}

@Component({
  selector: 'app-periscope-content',
  templateUrl: './periscope-content.component.html',
  styleUrls: ['./periscope-content.component.css']
})
export class PeriscopeContentComponent implements OnInit, AfterViewInit {
  @Input() element: PeriscopeElement;
  @ViewChild('embed', {static: false}) embed: ElementRef;
  private embedWidth = '100%';
  private embedHeight = '200px';

  constructor(
    private messageService: MessageService,
  ) {
  }
  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  @HostListener('window:message', ['$event'])
  receivePeriscopeMessage(event) {
    if (!event || !event.source || !event.data) { return; }
    if (this.embed.nativeElement.contentWindow !== event.source.window) { return; }
    switch (event.data.event_type) {
      case 'dashboard_resize': this.updateEmbedSize(event.data.dashboard_width, event.data.dashboard_height);
    }
  }

  updateEmbedSize(width: number, height: number) {
    // if we reduce the periscope iframe's width, periscope will resize the dashboard and send us a new, smaller size,
    // resulting in a loop until the dashboard is at its minimum displayable size
    this.embedHeight = `${height + 24}px`;
  }

  clickIframe() {
    this.messageService.sendMessage('iframeClick', 'PeriscopeContentComponent');
  }
}
