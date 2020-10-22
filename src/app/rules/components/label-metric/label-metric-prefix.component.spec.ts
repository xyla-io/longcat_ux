import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelMetricComponent } from './label-metric.component';

describe('LabelMetricComponent', () => {
  let component: LabelMetricComponent;
  let fixture: ComponentFixture<LabelMetricComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelMetricComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelMetricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
