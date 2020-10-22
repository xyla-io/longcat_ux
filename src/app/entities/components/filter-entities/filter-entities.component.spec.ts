import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterEntitiesComponent } from './filter-entities.component';

describe('FilterEntitiesComponent', () => {
  let component: FilterEntitiesComponent;
  let fixture: ComponentFixture<FilterEntitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterEntitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterEntitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
