import { TestBed } from '@angular/core/testing';

import { ReportElementService } from './report-element.service';

describe('ReportElementService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReportElementService = TestBed.get(ReportElementService);
    expect(service).toBeTruthy();
  });
});
