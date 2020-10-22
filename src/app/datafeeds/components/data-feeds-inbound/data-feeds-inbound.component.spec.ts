import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataFeedsInboundComponent } from './data-feeds-inbound.component';

describe('DataFeedsInboundComponent', () => {
  let component: DataFeedsInboundComponent;
  let fixture: ComponentFixture<DataFeedsInboundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataFeedsInboundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFeedsInboundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
