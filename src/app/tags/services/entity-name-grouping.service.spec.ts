import { TestBed } from '@angular/core/testing';

import { EntityNameGroupingService } from './entity-name-grouping.service';

describe('EntityNameGroupingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EntityNameGroupingService = TestBed.get(EntityNameGroupingService);
    expect(service).toBeTruthy();
  });
});
