import { TestBed, inject } from '@angular/core/testing';

import { TaggingAlertService } from './tagging-alert.service';

describe('TaggingAlert.ServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaggingAlertService]
    });
  });

  it('should be created', inject([TaggingAlertService], (service: TaggingAlertService) => {
    expect(service).toBeTruthy();
  }));
});
