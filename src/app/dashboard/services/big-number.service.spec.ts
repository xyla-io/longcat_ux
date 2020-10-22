import { TestBed } from '@angular/core/testing';
import DataFrame from 'dataframe-js';
import { Model, DataSet } from 'development_packages/xylo/src/browser';

import {
  BigNumberService,
  ModelBigNumber,
  ModelBigNumberQuotient,
  TemplateBigNumberQuotient,
} from './big-number.service';

fdescribe('BigNumberService', () => {

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

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    const service: BigNumberService = TestBed.get(BigNumberService);
    expect(service).toBeTruthy();
  });

  it('should validate a TemplateBigNumberQuotient', () => {
    expect(BigNumberService.isQuotientTemplate({
      eventColumn: 'event_name',
      eventName: 'install',
    })).toBeTruthy();
  });

  it('should validate a ModelBigNumberQuotient', () => {
    expect(BigNumberService.isQuotientModel({
      eventCount: 7,
      costPerEvent: 1.42,
    })).toBeTruthy();
  });

  it('should instantiate a ModelBigNumber', () => {
    const service: BigNumberService = TestBed.get(BigNumberService);
    const instance = service.instantiate(model, {
      dataSet: 'cube',
      totalColumn: 'x',
      label: 'X',
      size: 'normal',
    })
    expect(instance.total).toBe(10);
    expect(instance.displayValue).toBe(10);
  });

  it('should instantiate an ModelBigNumberQuotient', () => {
    const service: BigNumberService = TestBed.get(BigNumberService);
    let template: TemplateBigNumberQuotient = {
      dataSet: 'cube',
      totalColumn: 'x',
      label: 'X',
      size: 'normal',
      eventColumn: 'event',
      eventName: 'register',
    };
    const instance = service.instantiate(model, template) as ModelBigNumberQuotient;
    expect(instance.total).toBe(10);
    expect(instance.eventCount).toBe(2);
    expect(instance.costPerEvent).toBe(5);
    expect(instance.displayValue).toBe(5);
  });
});
