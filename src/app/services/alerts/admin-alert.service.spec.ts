import { TestBed, inject } from '@angular/core/testing';

import { AdminAlertService } from './admin-alert.service';

describe('AdminAlertService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminAlertService]
    });
  });

  it('should be created', inject([AdminAlertService], (service: AdminAlertService) => {
    expect(service).toBeTruthy();
  }));
});
