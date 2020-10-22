import { TestBed } from '@angular/core/testing';

import { ViewTemplateService } from './view-template.service';

describe('ViewTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ViewTemplateService = TestBed.get(ViewTemplateService);
    expect(service).toBeTruthy();
  });
});
