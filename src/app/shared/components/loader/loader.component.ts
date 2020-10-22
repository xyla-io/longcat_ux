import { Component, OnInit, Input } from '@angular/core';
import { ICellRenderer } from 'ag-grid-community';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit, ICellRenderer {
  @Input() size: number = 50;

  lottieConfig: Object;
  anim: any;

  constructor() { }

  ngOnInit() {
    this.lottieConfig = {
      path: 'assets/xyla_loader.json',
      renderer: 'canvas',
      autoplay: true,
      loop: true
    };
  }

  handleAnimation(anim: any) {
    this.anim = anim;
  }

  agInit(params) {
    this.size = params.size;
  }

  refresh(params) {
    this.size = params.size;
    return false;
  }

}
