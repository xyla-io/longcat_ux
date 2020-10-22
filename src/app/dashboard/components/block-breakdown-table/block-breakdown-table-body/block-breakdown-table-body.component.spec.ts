import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockBreakdownTableBodyComponent } from './block-breakdown-table-body.component';

describe('BlockBreakdownTableBodyComponent', () => {
  let component: BlockBreakdownTableBodyComponent;
  let fixture: ComponentFixture<BlockBreakdownTableBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockBreakdownTableBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockBreakdownTableBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
