import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeAccountComponent } from './node-account.component';

describe('NodeAccountComponent', () => {
  let component: NodeAccountComponent;
  let fixture: ComponentFixture<NodeAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
