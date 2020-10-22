import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XylaSwitchContentComponent } from './xyla-switch-content.component';

describe('XylaSwitchContentComponent', () => {
  let component: XylaSwitchContentComponent;
  let fixture: ComponentFixture<XylaSwitchContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ XylaSwitchContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(XylaSwitchContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
