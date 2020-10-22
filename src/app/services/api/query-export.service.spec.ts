import { TestBed, inject } from '@angular/core/testing';

import { QueryExportService } from './query-export.service';

describe('QueryExportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QueryExportService]
    });
  });

  it('should be created', inject([QueryExportService], (service: QueryExportService) => {
    expect(service).toBeTruthy();
  }));
});
