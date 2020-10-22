import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaterangeSelectorComponent } from './daterange-selector.component';

describe('DaterangeSelectorComponent', () => {
  let component: DaterangeSelectorComponent;
  let fixture: ComponentFixture<DaterangeSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaterangeSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaterangeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
