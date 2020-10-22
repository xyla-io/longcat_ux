import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XylaContentComponent } from './xyla-content.component';

describe('XylaContentComponent', () => {
  let component: XylaContentComponent;
  let fixture: ComponentFixture<XylaContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XylaContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XylaContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
