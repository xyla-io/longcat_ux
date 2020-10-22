import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBreakdownTableColumnsComponent } from './edit-breakdown-table-columns.component';

describe('EditBreakdownTableColumnsComponent', () => {
  let component: EditBreakdownTableColumnsComponent;
  let fixture: ComponentFixture<EditBreakdownTableColumnsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBreakdownTableColumnsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBreakdownTableColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
