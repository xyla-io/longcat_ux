import { TestBed } from '@angular/core/testing';

import { AdgroupService } from './adgroup.service';

describe('AdgroupService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdgroupService = TestBed.get(AdgroupService);
    expect(service).toBeTruthy();
  });
});
