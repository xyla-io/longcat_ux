import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TransitionController, TransitionDirection, Transition } from 'ng2-semantic-ui';

export enum ToastTypeEnum {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
}

export interface ShowToast {
  type: ToastTypeEnum;
  icon: string; // Semantic UI icon
  message: string;
  timeout?: number; // milliseconds
}

const DEFAULT_TIMEOUT = 2000; // milliseconds
const TRANSITION_IN_SUBTLE_NAME = 'fade up';
const TRANSITION_IN_EMPHASIZE_NAME = 'swing up';
const TRANSITION_OUT_NAME = 'fade up';
const TRANSITION_DURATION = 300; // milliseconds

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {

  @Input() toasts$: Subject<ShowToast>;
  toast: ShowToast|null = null;
  lastTimeout: number|null = null;
  destroyed$ = new Subject();
  public transitionController = new TransitionController();

  constructor() {}

  ngOnInit() {
    if (!this.toasts$) { return; }
    this.toasts$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(toast => this.showToast(toast));
  }

  showToast(toast: ShowToast) {
    this.toast = toast;
    const transitionIn = this.toast.type === ToastTypeEnum.Success ? TRANSITION_IN_SUBTLE_NAME : TRANSITION_IN_EMPHASIZE_NAME;
    setTimeout(() =>
      this.transitionController.animate(
        new Transition(transitionIn, TRANSITION_DURATION, TransitionDirection.In)
      ));
    if (this.lastTimeout) { clearTimeout(this.lastTimeout); }
    this.lastTimeout = window.setTimeout(() => {
      this.dismissToast();
    }, this.toast.timeout || DEFAULT_TIMEOUT);
  }

  dismissToast() {
    this.lastTimeout = null;
    this.transitionController.animate(
      new Transition(TRANSITION_OUT_NAME, TRANSITION_DURATION, TransitionDirection.Out, () => this.toast = null)
    )
  }

  onClickDismiss() {
    this.dismissToast();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
