import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataFeedsOutboundComponent } from './data-feeds-outbound.component';

describe('DataFeedsOutboundComponent', () => {
  let component: DataFeedsOutboundComponent;
  let fixture: ComponentFixture<DataFeedsOutboundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataFeedsOutboundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFeedsOutboundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
