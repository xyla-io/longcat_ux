import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodePerformanceGroupComponent } from './node-performance-group.component';

describe('NodePerformanceGroupComponent', () => {
  let component: NodePerformanceGroupComponent;
  let fixture: ComponentFixture<NodePerformanceGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodePerformanceGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodePerformanceGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
