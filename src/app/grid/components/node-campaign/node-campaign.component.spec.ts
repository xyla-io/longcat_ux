import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeCampaignComponent } from './node-campaign.component';

describe('NodeCampaignComponent', () => {
  let component: NodeCampaignComponent;
  let fixture: ComponentFixture<NodeCampaignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeCampaignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
