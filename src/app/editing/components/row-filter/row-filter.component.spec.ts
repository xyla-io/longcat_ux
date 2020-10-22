import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RowFilterComponent } from './row-filter.component';

describe('RowFilterComponent', () => {
  let component: RowFilterComponent;
  let fixture: ComponentFixture<RowFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RowFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RowFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
