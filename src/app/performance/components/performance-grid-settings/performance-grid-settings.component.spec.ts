import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceGridSettingsComponent } from './performance-grid-settings.component';

describe('PerformanceGridSettingsComponent', () => {
  let component: PerformanceGridSettingsComponent;
  let fixture: ComponentFixture<PerformanceGridSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceGridSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceGridSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
