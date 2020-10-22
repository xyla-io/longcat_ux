import { TestBed } from '@angular/core/testing';

import { DaterangeService } from './daterange.service';

describe('DaterangeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DaterangeService = TestBed.get(DaterangeService);
    expect(service).toBeTruthy();
  });
});
