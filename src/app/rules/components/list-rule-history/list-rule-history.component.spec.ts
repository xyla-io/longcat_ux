import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRuleHistoryComponent } from './list-rule-history.component';

describe('ListRuleHistoryComponent', () => {
  let component: ListRuleHistoryComponent;
  let fixture: ComponentFixture<ListRuleHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListRuleHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListRuleHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
