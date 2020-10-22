import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphTestComponent } from './graph-test.component';

describe('GraphTestComponent', () => {
  let component: GraphTestComponent;
  let fixture: ComponentFixture<GraphTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
