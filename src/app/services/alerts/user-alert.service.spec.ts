import { TestBed, inject } from '@angular/core/testing';

import { UserAlertService } from './user-alert.service';

describe('AlertService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserAlertService]
    });
  });

  it('should be created', inject([UserAlertService], (service: UserAlertService) => {
    expect(service).toBeTruthy();
  }));
});
