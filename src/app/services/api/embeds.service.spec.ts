import { TestBed, inject } from '@angular/core/testing';

import { EmbedsService } from './embeds.service';

describe('EmbedsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmbedsService]
    });
  });

  it('should be created', inject([EmbedsService], (service: EmbedsService) => {
    expect(service).toBeTruthy();
  }));
});
