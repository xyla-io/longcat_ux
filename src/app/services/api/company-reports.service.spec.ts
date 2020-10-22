import { TestBed, inject } from '@angular/core/testing';

import { CompanyReportsService } from './company-reports.service';

describe('CompanyReportsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompanyReportsService]
    });
  });

  it('should be created', inject([CompanyReportsService], (service: CompanyReportsService) => {
    expect(service).toBeTruthy();
  }));
});
