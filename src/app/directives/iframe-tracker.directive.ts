import {
  Directive,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  Renderer2,
  HostListener,
} from '@angular/core';

@Directive({
  selector: '[appIframeTracker]'
})
export class IframeTrackerDirective implements OnInit {
  private iframeMouseOver: boolean;

  @Input() debug: boolean;
  @Output() iframeClick = new EventEmitter<ElementRef>();

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.renderer.listen(window, 'blur', () => this.onWindowBlur());
  }

  @HostListener('mouseover')
  private onIframeMouseOver() {
    console.log('iframe mouseover');
    this.iframeMouseOver = true;
  }

  @HostListener('mouseout')
  private onIframeMouseOut() {
    this.iframeMouseOver = false;
  }

  private onWindowBlur() {
    if (this.iframeMouseOver) {
      this.iframeClick.emit(this.element);
    }
  }
}
