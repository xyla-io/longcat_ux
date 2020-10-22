import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AbdetectService {
  document: any;
  displayAdBlockerModal$ = new Subject<boolean>();

  constructor(
    @Inject(DOCUMENT) document,
  ) { 
    this.document = document;
  }

  public get adBlockerDetected(): boolean {
    return this.checkForBaitElement();
  }

  public showAdBlockModal() {
    this.displayAdBlockerModal$.next(true);
  }

  private get adBaitElement(): any {
    // Look for the element that should have been inserted into the document
    // by the banner-ad.js script loaded in index.html
    return this.document.getElementById('MnYLhBvxTIZPD');
  }

  private checkForBaitElement(): boolean {
    return this.adBaitElement ? false : true;
  }
}
