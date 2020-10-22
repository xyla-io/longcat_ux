import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerWelcomeComponent } from './partner-welcome.component';

describe('PartnerWelcomeComponent', () => {
  let component: PartnerWelcomeComponent;
  let fixture: ComponentFixture<PartnerWelcomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnerWelcomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnerWelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
