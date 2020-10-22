import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeSwitchComponent } from './node-switch.component';

describe('NodeSwitchComponent', () => {
  let component: NodeSwitchComponent;
  let fixture: ComponentFixture<NodeSwitchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeSwitchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
