import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeContentComponent } from './mode-content.component';

describe('ModeContentComponent', () => {
  let component: ModeContentComponent;
  let fixture: ComponentFixture<ModeContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModeContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
