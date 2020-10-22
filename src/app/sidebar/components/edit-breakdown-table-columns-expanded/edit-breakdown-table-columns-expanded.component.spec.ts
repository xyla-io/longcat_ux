import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBreakdownTableColumnsExpandedComponent } from './edit-breakdown-table-columns-expanded.component';

describe('EditBreakdownTableColumnsExpandedComponent', () => {
  let component: EditBreakdownTableColumnsExpandedComponent;
  let fixture: ComponentFixture<EditBreakdownTableColumnsExpandedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBreakdownTableColumnsExpandedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBreakdownTableColumnsExpandedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
