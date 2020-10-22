import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceGridComponent } from './performance-grid.component';

describe('PerformanceGridComponent', () => {
  let component: PerformanceGridComponent;
  let fixture: ComponentFixture<PerformanceGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
