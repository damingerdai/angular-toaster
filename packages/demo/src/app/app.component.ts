import { AfterViewInit, Component } from '@angular/core';
import { 
  ToasterConfig, IToasterConfig, ToasterService, Toast, ToastType, DefaultTypeClasses, DefaultIconClasses
} from '../../../angular-toaster/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'demo';

  extendedTypeClasses = { ...DefaultTypeClasses, ...{ customtype: 'angular-toast-success' }};
  extendedIconClasses = { ...DefaultIconClasses, ...{ customtype: 'icon-error' }};


  config: IToasterConfig = new ToasterConfig({
    animation: 'fade', newestOnTop: true, positionClass: 'angular-toast-bottom-right', 
    toastContainerId: 1, timeout: 0, showCloseButton: true, // mouseoverTimerStop: true
    typeClasses: <ExtendedToastType>this.extendedTypeClasses, 
    iconClasses: <ExtendedToastType>this.extendedIconClasses
  });

  constructor (public toasterService: ToasterService) { }

  show(type: ToastType) {
		this.toasterService.pop({
			type,
			title: 'Hello world!',
			body: 'Toastr fun!',
			timeout: 10000
		});
	}


  popToast() {
    let toast = this.toasterService.pop({
      type: 'success', 
      title: 'Home Title', 
      body: 'Home Body'
    });

    window.setTimeout(() => toast.title = 'Updated Home Title', 1000)
  }

  persistentToast() {
    this.toasterService.popAsync({
      type: <ExtendedToastType>'customtype', 
      title: 'Click Me', 
      body: 'I am sticky with a really long body let us see what happens',
      tapToDismiss: false,
      onClickCallback: (t) => console.log(t.toastId),
      showCloseButton: true
    }).subscribe(x => console.log(x));
  }

  ngAfterViewInit() {
    console.log('entering view init');
    const t = 'bad value';
    const toast: Toast = {
      type: <ExtendedToastType>t,
      body: 'I am init toast'
    };
    this.toasterService.pop(toast);
  }

  toto() {
    console.log('todo button clicked');
    const toast: Toast = {
      type: 'success',
      body: 'I am todo toast',
      timeout: 5000,
      progressBar: true
    };
    this.toasterService.pop(toast);
  }

  clear() {
    this.toasterService.clear();
  }
}

type ExtendedToastType = ('customtype' | 'bad value') & ToastType;
