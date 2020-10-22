import { TestBed } from '@angular/core/testing';

import { IOMapService } from './iomap.service';

describe('IOMapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IOMapService = TestBed.get(IOMapService);
    expect(service).toBeTruthy();
  });
});
