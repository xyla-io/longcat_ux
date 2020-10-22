import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockBreakdownTableHeadingComponent } from './block-breakdown-table-heading.component';

describe('BlockBreakdownTableHeadingComponent', () => {
  let component: BlockBreakdownTableHeadingComponent;
  let fixture: ComponentFixture<BlockBreakdownTableHeadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockBreakdownTableHeadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockBreakdownTableHeadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
