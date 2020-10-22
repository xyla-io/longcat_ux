import { Component, OnInit } from '@angular/core';
import {
  TransitionController,
  Transition,
  TransitionDirection,
} from 'ng2-semantic-ui';

import { QueryResultsService, QueryResultsDownload } from 'src/app/services/downloads/query-results.service';

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.component.html',
  styleUrls: ['./downloads.component.css']
})
export class DownloadsComponent implements OnInit {
  maximizeTransition = new TransitionController();
  minimizeTransition = new TransitionController();
  minimized = false;
  downloads: QueryResultsDownload[] = [];

  constructor(private queryResultsService: QueryResultsService) { }

  ngOnInit() {
    this.queryResultsService.downloadsObservable.subscribe(update => {
      if (update.status) {
        this.downloads = update.status;
      } else {
        this.downloads = [];
      }

      if (update.completeDownload) {
        const blob = new Blob([update.completeDownload.data], {type: 'text/csv'});
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = update.completeDownload.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }

  clickToggleMinimize(event: any) {
    if (!this.minimized) {
      this.maximizeTransition.animate(
        new Transition('slide up', 200, TransitionDirection.Out,
          () => {
            this.minimized = !this.minimized;
            setTimeout(() => {
            this.minimizeTransition.animate(
              new Transition('scale', 200, TransitionDirection.In));
            }, 0);
          }));
    } else {
      this.minimizeTransition.animate(
        new Transition('scale', 200, TransitionDirection.Out,
          () => {
            this.minimized = !this.minimized;
            setTimeout(() => {
            this.maximizeTransition.animate(
              new Transition('slide up', 200, TransitionDirection.In));
            }, 0);
          }));
    }
  }
}
