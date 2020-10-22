import { TestBed } from '@angular/core/testing';

import { DashboardAlertService } from './dashboard-alert.service';

describe('DashboardAlertService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DashboardAlertService = TestBed.get(DashboardAlertService);
    expect(service).toBeTruthy();
  });
});
