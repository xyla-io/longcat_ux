import { TestBed } from '@angular/core/testing';

import { EditingService } from './editing.service';

describe('EditingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EditingService = TestBed.get(EditingService);
    expect(service).toBeTruthy();
  });
});
