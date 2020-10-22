import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionMultiSelectComponent } from './option-multi-select.component';

describe('OptionMultiSelectComponent', () => {
  let component: OptionMultiSelectComponent;
  let fixture: ComponentFixture<OptionMultiSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionMultiSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionMultiSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
