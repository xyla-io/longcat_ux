import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoCompanyComponent } from './no-company.component';

describe('NoCompanyComponent', () => {
  let component: NoCompanyComponent;
  let fixture: ComponentFixture<NoCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
