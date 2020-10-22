import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTagParserComponent } from './edit-tag-parser.component';

describe('EditTagParserComponent', () => {
  let component: EditTagParserComponent;
  let fixture: ComponentFixture<EditTagParserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTagParserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTagParserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
