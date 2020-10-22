import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeChartComponent } from './node-chart.component';

describe('NodeChartComponent', () => {
  let component: NodeChartComponent;
  let fixture: ComponentFixture<NodeChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
