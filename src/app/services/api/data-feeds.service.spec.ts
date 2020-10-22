import { TestBed, inject } from '@angular/core/testing';

import { DataFeedsService } from './data-feeds.service';

describe('DataFeedsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataFeedsService]
    });
  });

  it('should be created', inject([DataFeedsService], (service: DataFeedsService) => {
    expect(service).toBeTruthy();
  }));
});
