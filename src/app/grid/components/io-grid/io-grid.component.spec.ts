import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IoGridComponent } from './io-grid.component';

describe('IoGridComponent', () => {
  let component: IoGridComponent;
  let fixture: ComponentFixture<IoGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IoGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IoGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
