import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayColumnNameComponent } from './display-column-name.component';

describe('DisplayColumnNameComponent', () => {
  let component: DisplayColumnNameComponent;
  let fixture: ComponentFixture<DisplayColumnNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayColumnNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayColumnNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
