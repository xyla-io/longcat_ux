import { TestBed } from '@angular/core/testing';
import DataFrame from 'dataframe-js';
import { Model, DataSet } from 'development_packages/xylo/src/browser';

import {
  BreakdownTableService,
} from './breakdown-table.service';


fdescribe('BreakdownTableService', () => {

  let model: Model = new Model();
  model.addDataSet('cube', new DataSet(new DataFrame([
    { x: 5, event: 'install' },
    { x: 1, event: null },
    { x: 0, event: 'install' },
    { x: 0, event: 'register' },
    { x: 4, event: 'register' },
    { x: 0, event: 'install' },
    { x: 0, event: null },
  ], ['x', 'event'])));

  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BreakdownTableService = TestBed.get(BreakdownTableService);
    expect(service).toBeTruthy();
  });

});
