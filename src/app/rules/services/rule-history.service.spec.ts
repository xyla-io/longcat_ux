import { TestBed } from '@angular/core/testing';

import { RuleHistoryService } from './rule-history.service';

describe('RuleHistoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RuleHistoryService = TestBed.get(RuleHistoryService);
    expect(service).toBeTruthy();
  });
});
