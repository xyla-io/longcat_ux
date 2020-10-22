import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeRuleNotificationsComponent } from './badge-rule-notifications.component';

describe('BadgeRuleNotificationsComponent', () => {
  let component: BadgeEnabledRulesComponent;
  let fixture: ComponentFixture<BadgeEnabledRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BadgeEnabledRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeEnabledRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
