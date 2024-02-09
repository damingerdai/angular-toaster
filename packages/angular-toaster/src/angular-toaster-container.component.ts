import { Component, Inject, Input, OnDestroy, OnInit, Optional, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { IClearWrapper, IToasterConfig, Toast, ToasterConfigInjectionToken, defaultToasterConfig } from './angular-toaster-config';
import { ToasterService } from './angular-toaster.service';
import { Transitions } from './angular-toaster-animations';

@Component({
  selector: `toaster-container, angular-toaster-container, div[toaster-container], div[angular-toaster-container]`,
  templateUrl: './angular-toaster-container.component.html',
  styleUrl: './angular-toaster-container.component.css',
  animations: Transitions
})
export class ToasterContainerComponent implements OnInit, OnDestroy {

  private _toasterconfig: IToasterConfig;

  @Input() public set toasterconfig(_toasterconfig: IToasterConfig) {
    //this._toasterconfig = new ToasterConfig(_toasterconfig);
    this._toasterconfig =
    (this._defaultToasterConfig
      ? { ...defaultToasterConfig, ...this._defaultToasterConfig, ..._toasterconfig }
      : { ...defaultToasterConfig, ..._toasterconfig }) as Required<IToasterConfig>;
  }

  public get toasterconfig(): IToasterConfig {
    return this._toasterconfig;
  }

  public toasts: Toast[] = [];

  private toasterService = inject<ToasterService>(ToasterService);

  private addToastSubscriber!: Subscription;
  private clearToastsSubscriber!: Subscription;

  constructor(
    @Optional() @Inject(ToasterConfigInjectionToken) private _defaultToasterConfig: IToasterConfig
  ) {
    this._toasterconfig = (this._defaultToasterConfig ? { ...defaultToasterConfig, ...this._defaultToasterConfig } : defaultToasterConfig) as Required<IToasterConfig>;
    ;
  }

  ngOnInit(): void {
    this.registerSubscribers();
  }

  ngOnDestroy(): void {
    if (this.addToastSubscriber) { this.addToastSubscriber.unsubscribe(); }
    if (this.clearToastsSubscriber) { this.clearToastsSubscriber.unsubscribe(); }
  }

  // event handlers
  click(toast: Toast, isCloseButton?: boolean) {
    if (toast.onClickCallback) {
      toast.onClickCallback(toast);
    }

    const tapToDismiss = !this.isNullOrUndefined(toast.tapToDismiss)
      ? toast.tapToDismiss
      : this.toasterconfig.tapToDismiss;

    if (tapToDismiss || (toast.showCloseButton && isCloseButton)) {
      this.removeToast(toast);
    }
  }

  childClick($event: any) {
    this.click($event.value.toast, $event.value.isCloseButton);
  }

  removeToast(toast: Toast) {
    const index = this.toasts.indexOf(toast);
    if (index < 0) { return };

    const toastId = this.toastIdOrDefault(toast);

    this.toasts.splice(index, 1);

    if (toast.onHideCallback) { toast.onHideCallback(toast); }
    this.toasterService._removeToastSubject.next({ toastId: toastId, toastContainerId: toast.toastContainerId });
  }

  protected buildPositionClass(): string[] {
    const classes: string[] = ['angular-toast-container'];
    const position = this.toasterconfig.positionClass;
    if (position) {
      classes.push(position);
    }
    return classes;
  }

  protected buildToastCompClasses(toast: Toast): string[] {
    const classes: string[] = [];
    if (this.toasterconfig.iconClasses && this.toasterconfig.iconClasses?.[toast.type]) {
      classes.push(this.toasterconfig.iconClasses?.[toast.type] as string);
    }
    if (this.toasterconfig.typeClasses && this.toasterconfig.typeClasses?.[toast.type]) {
      classes.push(this.toasterconfig.typeClasses?.[toast.type] as string);
    }
    return classes;
  }

  // private functions
  private registerSubscribers() {
    this.addToastSubscriber = this.toasterService.addToast.subscribe((toast: Toast) => {
      console.log('addToastSubscriber');
      console.log(toast);
      this.addToast(toast);
    });

    this.clearToastsSubscriber = this.toasterService.clearToasts.subscribe((clearWrapper: IClearWrapper) => {
      this.clearToasts(clearWrapper);
    });
  }

  private addToast(toast: Toast) {
    if (toast.toastContainerId && this.toasterconfig.toastContainerId
      && toast.toastContainerId !== this.toasterconfig.toastContainerId) { return };

    if (!toast.type
      || !this.toasterconfig.typeClasses?.[toast.type]
      || !this.toasterconfig.iconClasses?.[toast.type]) {
      toast.type = this.toasterconfig.defaultToastType!;
    }

    if (this.toasterconfig.preventDuplicates && this.toasts.length > 0) {
      if (toast.toastId && this.toasts.some(t => t.toastId === toast.toastId)) {
        return;
      } else if (this.toasts.some(t => t.body === toast.body)) {
        return;
      }
    }

    if (this.isNullOrUndefined(toast.showCloseButton)) {
      if (typeof this.toasterconfig.showCloseButton === 'object') {
        toast.showCloseButton = this.toasterconfig.showCloseButton[toast.type];
      } else if (typeof this.toasterconfig.showCloseButton === 'boolean') {
        toast.showCloseButton = this.toasterconfig.showCloseButton as boolean;
      }
    }

    if (toast.showCloseButton) {
      toast.closeHtml = toast.closeHtml || this.toasterconfig.closeHtml;
    }

    toast.bodyOutputType = toast.bodyOutputType || this.toasterconfig.bodyOutputType;

    if (this.toasterconfig.newestOnTop) {
      this.toasts.unshift(toast);
      if (this.isLimitExceeded()) {
        this.toasts.pop();
      }
    } else {
      this.toasts.push(toast);
      if (this.isLimitExceeded()) {
        this.toasts.shift();
      }
    }

    if (toast.onShowCallback) {
      toast.onShowCallback(toast);
    }
  }

  private isLimitExceeded() {
    return this.toasterconfig.limit && this.toasts.length > this.toasterconfig.limit;
  }

  private removeAllToasts() {
    for (let i = this.toasts.length - 1; i >= 0; i--) {
      this.removeToast(this.toasts[i]);
    }
  }

  private clearToasts(clearWrapper: IClearWrapper) {
    const toastId = clearWrapper.toastId;
    const toastContainerId = clearWrapper.toastContainerId;

    if (this.isNullOrUndefined(toastContainerId) || (toastContainerId === this.toasterconfig.toastContainerId)) {
      this.clearToastsAction(toastId);
    }
  }

  private clearToastsAction(toastId?: string) {
    if (toastId) {
      this.removeToast(this.toasts.filter(t => t.toastId === toastId)[0]);
    } else {
      this.removeAllToasts();
    }
  }

  private toastIdOrDefault(toast: Toast) {
    return toast.toastId || '';
  }

  private isNullOrUndefined(value: any): boolean {
    return value === null || typeof value === 'undefined';
  }

}
