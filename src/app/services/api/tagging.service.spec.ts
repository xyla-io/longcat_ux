import { TestBed, inject } from '@angular/core/testing';

import { TaggingService } from './tagging.service';

describe('TaggingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaggingService]
    });
  });

  it('should be created', inject([TaggingService], (service: TaggingService) => {
    expect(service).toBeTruthy();
  }));
});
