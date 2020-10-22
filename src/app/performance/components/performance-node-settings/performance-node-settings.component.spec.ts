import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceNodeSettingsComponent } from './performance-node-settings.component';

describe('PerformanceNodeSettingsComponent', () => {
  let component: PerformanceNodeSettingsComponent;
  let fixture: ComponentFixture<PerformanceNodeSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PerformanceNodeSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformanceNodeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
