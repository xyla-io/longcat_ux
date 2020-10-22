import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRunIntervalComponent } from './edit-run-interval.component';

describe('EditRunIntervalComponent', () => {
  let component: EditRunIntervalComponent;
  let fixture: ComponentFixture<EditRunIntervalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRunIntervalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRunIntervalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
