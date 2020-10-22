import { TestBed } from '@angular/core/testing';

import { CompanyLogoService } from './company-logo.service';

describe('CompanyLogoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CompanyLogoService = TestBed.get(CompanyLogoService);
    expect(service).toBeTruthy();
  });
});
