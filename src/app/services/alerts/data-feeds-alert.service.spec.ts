import { TestBed, inject } from '@angular/core/testing';

import { DataFeedsAlertService } from './data-feeds-alert.service';

describe('DataFeedsAlertService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataFeedsAlertService]
    });
  });

  it('should be created', inject([DataFeedsAlertService], (service: DataFeedsAlertService) => {
    expect(service).toBeTruthy();
  }));
});
