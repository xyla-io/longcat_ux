import { Component, OnInit, AfterViewInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { AbdetectService } from 'src/app/services/integration/abdetect.service';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';

@Component({
  selector: 'app-adblock-modal',
  templateUrl: './adblock-modal.component.html',
  styleUrls: ['./adblock-modal.component.scss']
})
export class AdblockModalComponent implements OnInit, AfterViewInit {

  modal: NgxSmartModalComponent;

  constructor(
    private abdetect: AbdetectService,
    private modalService: NgxSmartModalService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.modal = this.modalService.getModal('adblockerDetectModal');
    this.abdetect.displayAdBlockerModal$.subscribe(shouldShow => {
      if (shouldShow) {
        this.modal.open()
      }
    });
  }

}
