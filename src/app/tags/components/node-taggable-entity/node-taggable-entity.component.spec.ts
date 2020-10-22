import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeTaggableEntityComponent } from './node-taggable-entity.component';

describe('NodeTaggableEntityComponent', () => {
  let component: NodeTaggableEntityComponent;
  let fixture: ComponentFixture<NodeTaggableEntityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeTaggableEntityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeTaggableEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
