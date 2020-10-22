import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonBankComponent } from './button-bank.component';

describe('ButtonBankComponent', () => {
  let component: ButtonBankComponent;
  let fixture: ComponentFixture<ButtonBankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonBankComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
