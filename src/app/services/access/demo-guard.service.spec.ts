import { TestBed } from '@angular/core/testing';

import { DemoGuardService } from './demo-guard.service';

describe('DemoGuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DemoGuardService = TestBed.get(DemoGuardService);
    expect(service).toBeTruthy();
  });
});
