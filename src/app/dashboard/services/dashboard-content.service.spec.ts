import { TestBed } from '@angular/core/testing';

import { DashboardContentService } from './dashboard-content.service';

describe('DashboardContentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DashboardContentService = TestBed.get(DashboardContentService);
    expect(service).toBeTruthy();
  });
});
