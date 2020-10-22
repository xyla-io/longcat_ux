import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XylaGridContentComponent } from './xyla-grid-content.component';

describe('XylaGridContentComponent', () => {
  let component: XylaGridContentComponent;
  let fixture: ComponentFixture<XylaGridContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XylaGridContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XylaGridContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
