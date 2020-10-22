import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionSingleSelectComponent } from './option-single-select.component';

describe('OptionSingleSelectComponent', () => {
  let component: OptionSingleSelectComponent;
  let fixture: ComponentFixture<OptionSingleSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionSingleSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionSingleSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
