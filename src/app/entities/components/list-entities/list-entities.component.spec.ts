import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEntitiesComponent } from './list-entities.component';

describe('ListEntitiesComponent', () => {
  let component: ListEntitiesComponent;
  let fixture: ComponentFixture<ListEntitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListEntitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListEntitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
