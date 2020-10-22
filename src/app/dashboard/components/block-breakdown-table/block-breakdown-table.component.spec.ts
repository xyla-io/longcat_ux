import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockBreakdownTableComponent } from './block-breakdown-table.component';

describe('BlockBreakdownTableComponent', () => {
  let component: BlockBreakdownTableComponent;
  let fixture: ComponentFixture<BlockBreakdownTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockBreakdownTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockBreakdownTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
