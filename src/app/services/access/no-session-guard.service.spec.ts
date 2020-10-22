import { TestBed, inject } from '@angular/core/testing';

import { NoSessionGuardService } from './no-session-guard.service';

describe('NoSessionGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NoSessionGuardService]
    });
  });

  it('should be created', inject([NoSessionGuardService], (service: NoSessionGuardService) => {
    expect(service).toBeTruthy();
  }));
});
