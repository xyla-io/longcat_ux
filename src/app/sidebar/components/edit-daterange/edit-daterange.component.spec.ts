import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDaterangeComponent } from './edit-daterange.component';

describe('EditDaterangeComponent', () => {
  let component: EditDaterangeComponent;
  let fixture: ComponentFixture<EditDaterangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDaterangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDaterangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
