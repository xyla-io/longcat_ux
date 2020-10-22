import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCheckRangeComponent } from './edit-check-range.component';

describe('EditCheckRangeComponent', () => {
  let component: EditCheckRangeComponent;
  let fixture: ComponentFixture<EditCheckRangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCheckRangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCheckRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
