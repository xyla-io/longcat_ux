import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadingChannelComponent } from './heading-channel.component';

describe('HeadingChannelComponent', () => {
  let component: HeadingChannelComponent;
  let fixture: ComponentFixture<HeadingChannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeadingChannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadingChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
