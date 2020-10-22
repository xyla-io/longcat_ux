import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeEntityLevelComponent } from './node-entity-level.component';

describe('NodeEntityLevelComponent', () => {
  let component: NodeEntityLevelComponent;
  let fixture: ComponentFixture<NodeEntityLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeEntityLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeEntityLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
