import { TestBed } from '@angular/core/testing';

import { XyloService } from './xylo.service';

describe('XyloService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: XyloService = TestBed.get(XyloService);
    expect(service).toBeTruthy();
  });
});
