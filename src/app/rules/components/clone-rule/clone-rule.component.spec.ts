import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneRuleComponent } from './clone-rule.component';

describe('CloneRuleComponent', () => {
  let component: CloneRuleComponent;
  let fixture: ComponentFixture<CloneRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloneRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloneRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
