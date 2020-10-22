import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonCircularComponent } from './button-circular.component';

describe('ButtonCircularComponent', () => {
  let component: ButtonCircularComponent;
  let fixture: ComponentFixture<ButtonCircularComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonCircularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonCircularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
