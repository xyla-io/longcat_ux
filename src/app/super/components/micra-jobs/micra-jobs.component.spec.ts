import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MicraJobsComponent } from './micra-jobs.component';

describe('MicraJobsComponent', () => {
  let component: MicraJobsComponent;
  let fixture: ComponentFixture<MicraJobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MicraJobsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MicraJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
