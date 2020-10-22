import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RawExportComponent } from './raw-export.component';

describe('RawExportComponent', () => {
  let component: RawExportComponent;
  let fixture: ComponentFixture<RawExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RawExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RawExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
