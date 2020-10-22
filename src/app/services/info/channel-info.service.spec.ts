import { TestBed } from '@angular/core/testing';

import { ChannelInfoService } from './channel-info.service';

describe('ChannelInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChannelInfoService = TestBed.get(ChannelInfoService);
    expect(service).toBeTruthy();
  });
});
