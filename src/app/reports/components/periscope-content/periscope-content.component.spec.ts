import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriscopeContentComponent } from './periscope-content.component';

describe('PeriscopeContentComponent', () => {
  let component: PeriscopeContentComponent;
  let fixture: ComponentFixture<PeriscopeContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriscopeContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriscopeContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
