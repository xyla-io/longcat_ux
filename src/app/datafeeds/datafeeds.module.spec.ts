import { DatafeedsModule } from './datafeeds.module';

describe('DatafeedsModule', () => {
  let datafeedsModule: DatafeedsModule;

  beforeEach(() => {
    datafeedsModule = new DatafeedsModule();
  });

  it('should create an instance', () => {
    expect(datafeedsModule).toBeTruthy();
  });
});
