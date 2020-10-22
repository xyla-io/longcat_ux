import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockBigNumberComponent } from './block-big-number.component';

describe('BlockBigNumberComponent', () => {
  let component: BlockBigNumberComponent;
  let fixture: ComponentFixture<BlockBigNumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockBigNumberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockBigNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
