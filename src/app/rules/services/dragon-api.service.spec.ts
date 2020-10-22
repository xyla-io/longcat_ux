import { TestBed } from '@angular/core/testing';

import { DragonAPIService } from './dragon-api.service';

describe('DragonAPIService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DragonAPIService = TestBed.get(DragonAPIService);
    expect(service).toBeTruthy();
  });
});
