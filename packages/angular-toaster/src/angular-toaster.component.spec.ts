import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { ToasterComponent } from './angular-toaster.component';
import { ToastType } from './angular-toaster-config';

type ExtendedToastType = ('customtype' | '') & ToastType;

describe('ToasterComponent', () => {
  let component: ToasterComponent;
  let fixture: ComponentFixture<ToasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToasterComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ToasterComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  describe('ngOnInit', () => {
    it('should map toasterconfig.timeout object if defined and type exists', () => {
      let fixture = TestBed.createComponent(ToasterComponent);
      let component = fixture.componentInstance;

      component.toasterconfig = { timeout: { 'info': 10.1 } };
      component.toast = { type: 'info', title: 'test', body: 'test' };
      component.ngOnInit();

      expect(component['timeout']).toBe(10.1)
    });

    it('should map toasterconfig.timeout object to undefined if defined and type does not exist', () => {
      let fixture = TestBed.createComponent(ToasterComponent);
      let component = fixture.componentInstance;
      component.toasterconfig = { timeout: { 'info': 10.1 } };
      component.toast = { type: 'custom' as ExtendedToastType, title: 'test', body: 'test' };
      component.ngOnInit();

      expect(component['timeout']).toBeUndefined();
    });
  });

  describe('mouseenter event', () => {
    it('should clear timer if mouseOverTimerStop is true', fakeAsync(() => {
      let fixture = TestBed.createComponent(ToasterComponent);
      let component = fixture.componentInstance;
      component.toasterconfig = { mouseoverTimerStop: true, timeout: 100 };
      component.toast = { type: 'success', title: 'test', body: 'test' };
      component.ngOnInit();
      component.ngAfterViewInit();

      expect(component['timeoutId']).toBeGreaterThan(0);

      fixture.debugElement.triggerEventHandler('mouseenter', {});
      tick(0);

      expect(component['timeoutId']).toBeNull();
      flush();
    }));

    it('should reset progressBarWidth if mouseOverTimerStop is true', fakeAsync(() => {
      let fixture = TestBed.createComponent(ToasterComponent);
      let component = fixture.componentInstance;
      component.toasterconfig = { mouseoverTimerStop: true, timeout: 100 };
      component.toast = { type: 'success', title: 'test', body: 'test', progressBar: true };
      component.ngOnInit();
      component.ngAfterViewInit();
      // tick for 10 milliseconds (first interval) to allow progressBar to set width
      tick(10);

      expect(component['timeoutId']).toBeGreaterThan(0);
      expect(component['progressBarWidth']).toBeGreaterThan(0);

      fixture.debugElement.triggerEventHandler('mouseenter', {});
      tick(0);

      expect(component['progressBarIntervalId']).toBeNull();
      expect(component['progressBarWidth']).toBe(0);
      flush();
    }));

    it('should not clear timer if mouseOverTimerStop is false', fakeAsync(() => {
      let fixture = TestBed.createComponent(ToasterComponent);
      let component = fixture.componentInstance;
      component.toasterconfig = { mouseoverTimerStop: false, timeout: 100 };
      component.toast = { type: 'success', title: 'test', body: 'test' };
      component.ngOnInit();
      component.ngAfterViewInit();

      expect(component['timeoutId']).toBeGreaterThan(0);

      fixture.debugElement.triggerEventHandler('mouseenter', {});
      tick(0);

      expect(component['timeoutId']).toBeGreaterThan(0);
      flush()
    }));

    it('should not clear timer if if mouseOverTimerStop is true and timeout is 0', fakeAsync(() => {
      component.toasterconfig = { mouseoverTimerStop: false, timeout: 0 };
      component.toast = { type: 'success', title: 'test', body: 'test' };
      component.ngOnInit();
      component.ngAfterViewInit();

      expect(component['timeoutId']).toBeNull();

      spyOn(window, 'clearTimeout');

      fixture.debugElement.triggerEventHandler('mouseenter', {});
      tick(0);

      expect(window.clearTimeout).not.toHaveBeenCalled();
      expect(component['timeoutId']).toBeNull();
      flush();
    }));

  });

  describe('mouseleave event', () => {
    it('should restart timer if mouseOverTimerStop is true and timeoutId not defined', fakeAsync(() => {
      component.toasterconfig = { mouseoverTimerStop: true, timeout: 100 };
      component.toast = { type: 'success', title: 'test', body: 'test' };
      component.ngOnInit();
      component.ngAfterViewInit();

      expect(component['timeoutId']).toBeGreaterThan(0);

      component.stopTimer();

      expect(component['timeoutId']).toBeNull();

      spyOn<any>(component, 'configureTimer').and.callThrough();
      spyOn<any>(component, 'removeToast').and.callThrough();

      fixture.debugElement.triggerEventHandler('mouseleave', {});

      tick(0);

      expect(component['timeoutId']).toBeGreaterThan(0);

      expect(component['configureTimer']).toHaveBeenCalled();
      expect(component['removeToast']).not.toHaveBeenCalled();
      expect(component['timeoutId']).toBeGreaterThan(0);
      expect(flush()).toBe(100);
    }));

    it('should not restart timer if mouseOverTimerStop is true and timeoutId is defined', fakeAsync(() => {
      component.toasterconfig = { mouseoverTimerStop: true, timeout: 100 };
      component.toast = { type: 'success', title: 'test', body: 'test' };
      component.ngOnInit();
      component.ngAfterViewInit();

      expect(component['timeoutId']).toBeGreaterThan(0);

      spyOn<any>(component, 'configureTimer').and.callThrough();
      spyOn(window, 'setTimeout');

      tick(50);

      fixture.debugElement.triggerEventHandler('mouseleave', {});

      tick(0);

      expect(component['configureTimer']).not.toHaveBeenCalled();
      expect(window.setTimeout).not.toHaveBeenCalled();
      expect(component['timeoutId']).toBeDefined();

      // the timeer did not restart and the remainder needs to be flushed
      flush();
    }));

    it('should not restart timer if mouseOverTimerStop is false', fakeAsync(() => {
      component.toasterconfig = { mouseoverTimerStop: false, timeout: 100 };
      component.toast = { type: 'success', title: 'test', body: 'test' };
      component.ngOnInit();
      component.ngAfterViewInit();

      expect(component['timeoutId']).toBeGreaterThan(0);

      spyOn<any>(component, 'configureTimer').and.callThrough();
      spyOn(window, 'setTimeout');

      tick(50);
      expect(component['timeoutId']).toBeGreaterThan(0);

      fixture.debugElement.triggerEventHandler('mouseleave', {});

      tick(0);

      expect(component['configureTimer']).not.toHaveBeenCalled();
      expect(window.setTimeout).not.toHaveBeenCalled();
      expect(component['timeoutId']).toBeGreaterThan(0);
      flush();
    }));

    it('should not restart timer if mouseOverTimerStop is false and toast.timeout is 0', fakeAsync(() => {
      component.toasterconfig = { mouseoverTimerStop: false };
      component.toast = { type: 'success', title: 'test', body: 'test', timeout: 0 };
      component.ngOnInit();
      component.ngAfterViewInit();

      expect(component['timeoutId']).toBeNull();

      spyOn<any>(component, 'configureTimer').and.callThrough();
      spyOn(window, 'setTimeout');

      fixture.debugElement.triggerEventHandler('mouseleave', {});

      tick(0);

      expect(component['configureTimer']).not.toHaveBeenCalled();
      expect(window.setTimeout).not.toHaveBeenCalled();
      expect(component['timeoutId']).toBeNull();
      flush();
    }));

    it('should remove toast if mouseOverTimerStop is false and timeoutId is null and timeout has value', fakeAsync(() => {
      component.toasterconfig = { mouseoverTimerStop: false, timeout: 100 };
      component.toast = { type: 'success', title: 'test', body: 'test' };
      component.ngOnInit();
      component.ngAfterViewInit();

      expect(component['timeoutId']).toBeGreaterThan(0);

      spyOn<any>(component, 'configureTimer').and.callThrough();
      spyOn<any>(component, 'removeToast').and.callThrough();

      component['clearTimers']();

      expect(component['timeoutId']).toBeNull();
      expect(component['removeToast']).not.toHaveBeenCalled();

      fixture.debugElement.triggerEventHandler('mouseleave', {});

      tick(0);

      expect(component['timeoutId']).toBeNull();
      expect(component['configureTimer']).not.toHaveBeenCalled();
      expect(component['removeToast']).toHaveBeenCalled();
      flush();
    }));

    it('should not remove toast if mouseOverTimerStop is false and timeoutId is null and toast is sticky', fakeAsync(() => {
      component.toasterconfig = { mouseoverTimerStop: false, timeout: 0 };
      component.toast = { type: 'success', title: 'test', body: 'test' };
      component.ngOnInit();
      component.ngAfterViewInit();

      expect(component['timeoutId']).toBeNull();

      spyOn<any>(component, 'configureTimer').and.callThrough();
      spyOn<any>(component, 'removeToast').and.callThrough();

      fixture.debugElement.triggerEventHandler('mouseleave', {});

      tick(0);

      expect(component['timeoutId']).toBeNull();
      expect(component['configureTimer']).not.toHaveBeenCalled();
      expect(component['removeToast']).not.toHaveBeenCalled();
      flush();
    }));
  })

  describe('updateProgressBar', () => {
    it('should return if progressBarWidth is 0', () => {
      component.toasterconfig = { mouseoverTimerStop: false, timeout: 0 };
      component.toast = { type: 'success', title: 'test', body: 'test' };
      component.ngOnInit();
      component.ngAfterViewInit();

      component.progressBarWidth = 0;

      component['updateProgressBar']();

      expect(component.progressBarWidth).toBe(0);
    });

    it('should return if progressBarWidth is 100', () => {
      component.toasterconfig = { mouseoverTimerStop: false, timeout: 0 };
      component.toast = { type: 'success', title: 'test', body: 'test' };
      component.ngOnInit();
      component.ngAfterViewInit();

      component.progressBarWidth = 100;

      component['updateProgressBar']();

      expect(component.progressBarWidth).toBe(100);
    });

    it('should update progressBarWidth if in between 0 and 100', () => {
      component.toasterconfig = { mouseoverTimerStop: false, timeout: 100 };
      component.toast = { type: 'success', title: 'test', body: 'test' };
      component.ngOnInit();
      component.ngAfterViewInit();

      component.progressBarWidth = 25;
      component['removeToastTick'] = new Date().getTime() + 75;

      component['updateProgressBar']();
      expect(component.progressBarWidth).toBeGreaterThan(70);
      expect(component.progressBarWidth).toBeLessThan(80);
    });

    it('should invert progressBarWidth if progressBarDirection is increasing', () => {
      component.toasterconfig = { mouseoverTimerStop: false, timeout: 100 };
      component.toast = { type: 'success', title: 'test', body: 'test', progressBarDirection: 'increasing' };
      component.ngOnInit();
      component.ngAfterViewInit();

      component.progressBarWidth = 25;
      component['removeToastTick'] = new Date().getTime() + 75;

      component['updateProgressBar']();
      expect(component.progressBarWidth).toBeGreaterThan(20);
      expect(component.progressBarWidth).toBeLessThan(30);
    });

    it('should set progressBarWidth to 0 if offset is less than 0', () => {
      component.toasterconfig = { mouseoverTimerStop: false, timeout: 100 };
      component.toast = { type: 'success', title: 'test', body: 'test' };
      component.ngOnInit();
      component.ngAfterViewInit();

      component.progressBarWidth = 25;
      component['removeToastTick'] = new Date().getTime() - 75;

      component['updateProgressBar']();
      expect(component.progressBarWidth).toBe(0);
    });

    it('should set progressBarWidth to 100 if offset is greater than 100', () => {
      component.toasterconfig = { mouseoverTimerStop: false, timeout: 100 };
      component.toast = { type: 'success', title: 'test', body: 'test' };
      component.ngOnInit();
      component.ngAfterViewInit();

      component.progressBarWidth = 75;
      component['removeToastTick'] = new Date().getTime() + 101;

      component['updateProgressBar']();
      expect(component.progressBarWidth).toBe(100);
    });
  });

});
