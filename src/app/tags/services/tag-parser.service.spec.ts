import { TestBed } from '@angular/core/testing';

import { TagParserService } from './tag-parser.service';

describe('TagParserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TagParserService = TestBed.get(TagParserService);
    expect(service).toBeTruthy();
  });
});
