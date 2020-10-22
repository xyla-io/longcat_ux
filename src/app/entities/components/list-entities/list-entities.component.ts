import {
  Component,
  Input,
  ViewChild,
  OnInit,
  AfterViewInit
} from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { TaggingService, TaggingEntity } from 'src/app/services/api/tagging.service';
import { APIQueryResult } from 'src/app/services/api/api.service';
import { ListCampaignsComponent } from '../list-campaigns/list-campaigns.component';
import { ListAdsComponent } from '../list-ads/list-ads.component';
import { ObservableResult } from 'src/app/util/request-loaders/api-loaders';

const taggingHelperMap = {
  'campaign': ListCampaignsComponent,
  'ad': ListAdsComponent,
};

@Component({
  selector: 'app-list-entities',
  templateUrl: './list-entities.component.html',
  styleUrls: ['./list-entities.component.css']
})
export class ListEntitiesComponent implements OnInit, AfterViewInit {
  @Input() entityName: string;
  @Input() companyIdentifier: string;

  entityObservable: Observable<ObservableResult<APIQueryResult>>;
  entity: TaggingEntity;

  constructor(
    private taggingService: TaggingService,
  ) { }

  ngOnInit() {
    this.entity = this.taggingService.entities[this.entityName];
    this.entityObservable = this.taggingService.getEntityObservable(this.entity.name);
  }

  ngAfterViewInit() {
    this.taggingService.refreshEntities(this.entity.name);
  }
}
