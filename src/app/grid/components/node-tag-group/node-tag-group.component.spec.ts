import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeTagGroupComponent } from './node-tag-group.component';

describe('NodeTagGroupComponent', () => {
  let component: NodeTagGroupComponent;
  let fixture: ComponentFixture<NodeTagGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeTagGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeTagGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
