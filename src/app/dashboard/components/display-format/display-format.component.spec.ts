import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayFormatComponent } from './display-format.component';

describe('DisplayFormatComponent', () => {
  let component: DisplayFormatComponent;
  let fixture: ComponentFixture<DisplayFormatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayFormatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayFormatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
