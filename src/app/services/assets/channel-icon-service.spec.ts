import { TestBed, inject } from '@angular/core/testing';

import { ChannelIconService } from './channel-icon.service';

describe('ChannelIconService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChannelIconService]
    });
  });

  it('should be created', inject([ChannelIconService], (service: ChannelIconService) => {
    expect(service).toBeTruthy();
  }));
});
