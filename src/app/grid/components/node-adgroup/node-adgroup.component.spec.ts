import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeAdgroupComponent } from './node-adgroup.component';

describe('NodeAdgroupComponent', () => {
  let component: NodeAdgroupComponent;
  let fixture: ComponentFixture<NodeAdgroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeAdgroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeAdgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
