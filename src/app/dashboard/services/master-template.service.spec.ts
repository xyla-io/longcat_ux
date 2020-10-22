import { TestBed } from '@angular/core/testing';

import { MasterTemplateService } from './master-template.service';

describe('MasterTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MasterTemplateService = TestBed.get(MasterTemplateService);
    expect(service).toBeTruthy();
  });
});
