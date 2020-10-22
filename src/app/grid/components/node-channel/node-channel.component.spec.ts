import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeChannelComponent } from './node-channel.component';

describe('NodeChannelComponent', () => {
  let component: NodeChannelComponent;
  let fixture: ComponentFixture<NodeChannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeChannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
