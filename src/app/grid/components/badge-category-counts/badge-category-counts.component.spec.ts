import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeCategoryCountsComponent } from './badge-category-counts.component';

describe('BadgeCategoryCountsComponent', () => {
  let component: BadgeCategoryCountsComponent;
  let fixture: ComponentFixture<BadgeCategoryCountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BadgeCategoryCountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeCategoryCountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
