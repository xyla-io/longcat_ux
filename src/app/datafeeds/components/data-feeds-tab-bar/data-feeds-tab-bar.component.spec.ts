import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataFeedsTabBarComponent } from './data-feeds-tab-bar.component';

describe('DataFeedsTabBarComponent', () => {
  let component: DataFeedsTabBarComponent;
  let fixture: ComponentFixture<DataFeedsTabBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataFeedsTabBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFeedsTabBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
