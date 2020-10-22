import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAdsComponent } from './list-ads.component';

describe('ListAdsComponent', () => {
  let component: ListAdsComponent;
  let fixture: ComponentFixture<ListAdsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListAdsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListAdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
