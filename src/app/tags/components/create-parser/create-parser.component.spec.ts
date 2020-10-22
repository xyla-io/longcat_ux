import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateParserComponent } from './create-parser.component';

describe('CreateParserComponent', () => {
  let component: CreateParserComponent;
  let fixture: ComponentFixture<CreateParserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateParserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateParserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
