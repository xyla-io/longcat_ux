import { TestBed, inject } from '@angular/core/testing';

import { InvitationAlertService } from './invitation-alert.service';

describe('InvitationAlertService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InvitationAlertService]
    });
  });

  it('should be created', inject([InvitationAlertService], (service: InvitationAlertService) => {
    expect(service).toBeTruthy();
  }));
});
