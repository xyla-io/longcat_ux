import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DaterangeBuilderComponent } from './daterange-builder.component';

describe('DaterangeBuilderComponent', () => {
  let component: DaterangeBuilderComponent;
  let fixture: ComponentFixture<DaterangeBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DaterangeBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DaterangeBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
