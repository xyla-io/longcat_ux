import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitchCompanyComponent } from './switch-company.component';

describe('SwitchCompanyComponent', () => {
  let component: SwitchCompanyComponent;
  let fixture: ComponentFixture<SwitchCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwitchCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitchCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
