import { TestBed, inject } from '@angular/core/testing';

import { SessionGuardService } from './session-guard.service';

describe('SessionGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionGuardService]
    });
  });

  it('should be created', inject([SessionGuardService], (service: SessionGuardService) => {
    expect(service).toBeTruthy();
  }));
});
