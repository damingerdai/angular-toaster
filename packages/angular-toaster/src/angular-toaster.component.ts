import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, NgZone, OnDestroy, OnInit, Output, Renderer2, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { BodyOutputType, IToasterConfig, Toast } from './angular-toaster-config';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[toastComp]',
  templateUrl: './angular-toaster.component.html',
  styleUrls: ['./angular-toaster.component.css']
})
export class ToasterComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() toasterconfig!: IToasterConfig;
  @Input() toast!: Toast;
  @Input() titleClass!: string;
  @Input() messageClass!: string;
  @ViewChild('componentBody', { read: ViewContainerRef, static: false }) componentBody!: ViewContainerRef;

  private viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
  private changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private ngZone: NgZone = inject(NgZone);
  private element: ElementRef = inject(ElementRef);
  private renderer2: Renderer2 = inject(Renderer2);

  public progressBarWidth: number = -1;
  public bodyOutputType = BodyOutputType;

  @Output()
  public clickEvent = new EventEmitter();
  @Output()
  public removeToastEvent = new EventEmitter<Toast>();

  private timeoutId?: number | null = null;
  private timeout: number | null = 0;
  private progressBarIntervalId?: number | null = null;
  private removeToastTick!: number | null;

  private removeMouseOverListener!: () => void;

  constructor() { }

  ngOnInit() {
    if (this.toast.progressBar) {
      this.toast.progressBarDirection = this.toast.progressBarDirection || 'decreasing';
    }

    let timeout = (typeof this.toast.timeout === 'number')
      ? this.toast.timeout : this.toasterconfig.timeout;

    if (typeof timeout === 'object') {
      timeout = timeout[this.toast.type];
    }

    this.timeout = timeout!;
  }

  ngAfterViewInit() {
    if (this.toast.bodyOutputType === this.bodyOutputType.Component) {
      const componentInstance: any = this.viewContainerRef.createComponent(this.toast.body, undefined, this.componentBody.injector)
      componentInstance.instance.toast = this.toast;
      this.changeDetectorRef.detectChanges();
    }

    if (this.toasterconfig.mouseoverTimerStop) {
      // only apply a mouseenter event when necessary to avoid
      // unnecessary event and change detection cycles.
      this.removeMouseOverListener = this.renderer2.listen(
        this.element.nativeElement,
        'mouseenter',
        () => this.stopTimer()
      );
    }

    this.configureTimer();
  }

  click(event: MouseEvent, toast: Toast) {
    event.stopPropagation();
    this.clickEvent.emit({ value: { toast: toast, isCloseButton: true } });
  }

  stopTimer() {
    this.progressBarWidth = 0;
    this.clearTimers();
  }

  @HostListener('mouseleave')
  restartTimer() {
    if (this.toasterconfig.mouseoverTimerStop) {
      if (!this.timeoutId) {
        this.configureTimer();
      }
    } else if (this.timeout && !this.timeoutId) {
      this.removeToast();
    }
  }

  ngOnDestroy() {
    if (this.removeMouseOverListener) {
      this.removeMouseOverListener();
    }
    this.clearTimers();
  }

  private configureTimer() {
    if (!this.timeout || this.timeout < 1) {
      return;
    }

    if (this.toast.progressBar) {
      this.removeToastTick = new Date().getTime() + this.timeout;
      this.progressBarWidth = -1;
    }

    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = window.setTimeout(() => {
        this.ngZone.run(() => {
          this.changeDetectorRef.markForCheck();
          this.removeToast();
        });
      }, this.timeout!);

      if (this.toast.progressBar) {
        this.progressBarIntervalId = window.setInterval(() => {
          this.ngZone.run(() => {
            this.updateProgressBar();
          });
        }, 10);
      }
    });
  }

  private updateProgressBar() {
    if (this.progressBarWidth === 0 || this.progressBarWidth === 100) {
      return;
    }

    this.progressBarWidth = ((this.removeToastTick! - new Date().getTime()) / this.timeout!) * 100;

    if (this.toast.progressBarDirection === 'increasing') {
      this.progressBarWidth = 100 - this.progressBarWidth;
    }
    if (this.progressBarWidth < 0) {
      this.progressBarWidth = 0;
    }
    if (this.progressBarWidth > 100) {
      this.progressBarWidth = 100;
    }
  }

  private clearTimers() {
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId)
    }

    if (this.progressBarIntervalId) {
      window.clearInterval(this.progressBarIntervalId);
    }

    this.timeoutId = null;
    this.progressBarIntervalId = null;
  }

  private removeToast() {
    this.removeToastEvent.emit(this.toast);
  }

}
