import { TestBed, inject } from '@angular/core/testing';

import { PermissionGroupsService } from './permission-groups.service';

describe('PermissionGroupsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PermissionGroupsService]
    });
  });

  it('should be created', inject([PermissionGroupsService], (service: PermissionGroupsService) => {
    expect(service).toBeTruthy();
  }));
});
