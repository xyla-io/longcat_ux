import { TestBed, inject } from '@angular/core/testing';
import { CompanyGuardService } from './company-guard.service';

describe('CompanyGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompanyGuardService]
    });
  });

  it('should be created', inject([CompanyGuardService], (service: CompanyGuardService) => {
    expect(service).toBeTruthy();
  }));
});
