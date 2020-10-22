import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { cloneDeep } from 'lodash-es';
import { SidebarContentType } from 'src/app/sidebar/factories/sidebar-content.factory';
import { EnhancedTemplateMaster, TemplateMaster } from 'src/app/dashboard/interfaces/master';
import { isBlockTemplate, AbstractTemplate } from 'src/app/dashboard/interfaces/template';
import { TemplateService } from 'src/app/dashboard/services/template.service';
import { MasterTemplateService } from 'src/app/dashboard/services/master-template.service';
import { SessionService } from 'src/app/services/api/session.service';

export interface EventRequestSidebar<T extends AbstractTemplate> {
  contentType: SidebarContentType;
  inputTemplate: T;
}

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  private _contentType$ = new BehaviorSubject<SidebarContentType>(SidebarContentType.Hidden);
  private _inputTemplate$ = new BehaviorSubject<AbstractTemplate>(null);
  private _masterTemplate$ = new BehaviorSubject<EnhancedTemplateMaster>(null);
  private _refreshSidebar$ = new BehaviorSubject<boolean>(false);

  get masterTemplate$(): Observable <EnhancedTemplateMaster> { return this._masterTemplate$.asObservable(); }
  get inputTemplate$(): Observable<AbstractTemplate> { return this._inputTemplate$.asObservable(); }
  get contentType$(): Observable<SidebarContentType> { return this._contentType$.asObservable(); }
  get refreshSidebar$(): Observable<boolean> { return this._refreshSidebar$.asObservable(); }

  constructor(
    private masterTemplateService: MasterTemplateService,
    private sessionService: SessionService,
  ) {
    this._refreshSidebar$.next(true);
    this.masterTemplateService.masterTemplateUpdate$.subscribe(masterTemplate => {
      this.updateMasterTemplate(masterTemplate);
    });
    this.sessionService.session$.subscribe(session => {
      this.hideSidebar();
    });
    this.sessionService.currentCompany$.subscribe(company => {
      this.hideSidebar();
    });

  }

  async requestSidebar(eventRequestSidebar: EventRequestSidebar<AbstractTemplate|any>) {
    const { contentType, inputTemplate } = eventRequestSidebar;
    this._contentType$.next(eventRequestSidebar.contentType);
    this._updateInputTemplate(inputTemplate, false);
    if (isBlockTemplate(inputTemplate)) {
      const masterTemplate = await this.masterTemplateService.getMasterTemplate(inputTemplate);
      this._updateMasterTemplate(masterTemplate, false);
    } else {
      this._updateMasterTemplate(null, false);
    }
    this._refreshSidebar$.next(true);
  }

  hideSidebar() {
    this._contentType$.next(SidebarContentType.Hidden);
    this._inputTemplate$.next(null);
    this._masterTemplate$.next(null);
    this._refreshSidebar$.next(true);
  }

  updateMasterTemplate(master: EnhancedTemplateMaster) {
    this._updateMasterTemplate(master);
    this._refreshSidebar$.next(true);
  }

  updateInputTemplate(template: AbstractTemplate) {
    this._updateInputTemplate(template);
    this._refreshSidebar$.next(true);
  }

  private _updateInputTemplate(template: AbstractTemplate, requireMatch = true) {
    if (requireMatch) {
      const { value } = this._inputTemplate$;
      if (!TemplateService.isSameTemplate(value, template)) { return; }
    }
    this._inputTemplate$.next(cloneDeep(template));
  }

  private _updateMasterTemplate(master: EnhancedTemplateMaster, requireMatch = true) {
    if (requireMatch) {
      const { value } = this._masterTemplate$;
      if (!TemplateService.isSameTemplate(value, master)) { return; }
    }
    this._masterTemplate$.next(cloneDeep(master));
  }

}
