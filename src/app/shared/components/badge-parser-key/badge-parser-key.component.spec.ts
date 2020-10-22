import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeParserKeyComponent } from './badge-parser-key.component';

describe('BadgeParserKeyComponent', () => {
  let component: BadgeParserKeyComponent;
  let fixture: ComponentFixture<BadgeParserKeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BadgeParserKeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeParserKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
