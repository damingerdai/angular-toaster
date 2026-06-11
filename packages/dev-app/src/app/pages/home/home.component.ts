import {
  AfterViewInit,
  Component,
  inject,
  ChangeDetectionStrategy,
} from "@angular/core";
import {
  DefaultTypeClasses,
  DefaultIconClasses,
  IToasterConfig,
  ToasterConfig,
  Toast,
  ToastType,
  ToasterService,
  ToasterContainerComponent,
} from "angular-toaster";

type ExtendedToastType = ("customtype" | "bad value") & ToastType;

@Component({
  selector: "app-home",
  imports: [ToasterContainerComponent],
  templateUrl: "./home.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./home.component.scss",
})
export class HomeComponent implements AfterViewInit {
  title = "dev-app";

  extendedTypeClasses = {
    ...DefaultTypeClasses,
    ...{ customtype: "angular-toast-success" },
  };
  extendedIconClasses = {
    ...DefaultIconClasses,
    ...{ customtype: "icon-error" },
  };

  config: IToasterConfig = new ToasterConfig({
    animation: "fade",
    newestOnTop: true,
    positionClass: "angular-toast-bottom-right",
    toastContainerId: 1,
    timeout: 0,
    showCloseButton: true, // mouseoverTimerStop: true
    typeClasses: this.extendedTypeClasses as ExtendedToastType,
    iconClasses: this.extendedIconClasses as ExtendedToastType,
  });

  public toasterService: ToasterService = inject(ToasterService);

  show(type: ToastType) {
    this.toasterService.pop({
      type,
      title: "Hello world!",
      body: "Toastr fun!",
      timeout: 10000,
    });
  }

  popToast() {
    const toast = this.toasterService.pop({
      type: "success",
      title: "Home Title",
      body: "Home Body",
    });

    window.setTimeout(() => (toast.title = "Updated Home Title"), 1000);
  }

  persistentToast() {
    this.toasterService
      .popAsync({
        type: "customtype" as ExtendedToastType,
        title: "Click Me",
        body: "I am sticky with a really long body let us see what happens",
        tapToDismiss: false,
        onClickCallback: (t) => console.log(t.toastId),
        showCloseButton: true,
      })
      .subscribe((x) => console.log(x));
  }

  ngAfterViewInit() {
    console.log("entering view init");
    const t = "bad value";
    const toast: Toast = {
      type: t as ExtendedToastType,
      body: "I am init toast",
    };
    this.toasterService.popAsync(toast);
  }

  toto() {
    console.log("todo button clicked");
    const toast: Toast = {
      type: "success",
      body: "I am todo toast",
      timeout: 5000,
      progressBar: true,
    };
    this.toasterService.pop(toast);
  }

  clear() {
    this.toasterService.clear();
  }
}
