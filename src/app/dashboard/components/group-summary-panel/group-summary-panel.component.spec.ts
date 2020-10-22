import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSummaryPanelComponent } from './group-summary-panel.component';

describe('GroupSummaryPanelComponent', () => {
  let component: GroupSummaryPanelComponent;
  let fixture: ComponentFixture<GroupSummaryPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupSummaryPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupSummaryPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
