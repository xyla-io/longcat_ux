import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBreakdownTableBreakdownsComponent } from './edit-breakdown-table-breakdowns.component';

describe('EditBreakdownTableBreakdownsComponent', () => {
  let component: EditBreakdownTableBreakdownsComponent;
  let fixture: ComponentFixture<EditBreakdownTableBreakdownsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBreakdownTableBreakdownsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBreakdownTableBreakdownsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
