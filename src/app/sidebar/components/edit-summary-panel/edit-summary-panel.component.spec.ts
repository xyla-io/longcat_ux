import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSummaryPanelComponent } from './edit-summary-panel.component';

describe('EditSummaryPanelComponent', () => {
  let component: EditSummaryPanelComponent;
  let fixture: ComponentFixture<EditSummaryPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSummaryPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSummaryPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
