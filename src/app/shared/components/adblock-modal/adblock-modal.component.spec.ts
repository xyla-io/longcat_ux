import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdblockModalComponent } from './adblock-modal.component';

describe('AdblockModalComponent', () => {
  let component: AdblockModalComponent;
  let fixture: ComponentFixture<AdblockModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdblockModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdblockModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
