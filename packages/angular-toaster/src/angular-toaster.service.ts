import { Injectable } from '@angular/core';
import { Observable, Observer, Subject, share } from 'rxjs';
import { IClearWrapper, Toast, ToastType } from './angular-toaster-config';

class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class ToasterService {

  public addToast: Observable<Toast>;
  private _addToast!: Observer<Toast>;

  public clearToasts: Observable<IClearWrapper>;
  private _clearToasts!: Observer<IClearWrapper>;

  removeToast: Observable<IClearWrapper>;
  /** @internal */
  _removeToastSubject: Subject<IClearWrapper>;

  constructor() {
    this.addToast = new Observable<Toast>((observer) => this._addToast = observer).pipe(share());
    this.clearToasts = new Observable<IClearWrapper>((observer) => this._clearToasts = observer).pipe(share());
    this._removeToastSubject = new Subject<IClearWrapper>()
    this.removeToast = this._removeToastSubject.pipe(share());
  }

  /**
    * Synchronously create and show a new toast instance.
    *
    * @param {(string | Toast)} type The type of the toast, or a Toast object.
    * @param {string=} title The toast title.
    * @param {string=} body The toast body.
    * @returns {Toast}
    *          The newly created Toast instance with a randomly generated GUID Id.
    */
  pop(type: ToastType | Toast, title?: string, body?: string): Toast {
    const toast = typeof type === 'string' ? { type: type, title: title, body: body } : type;

    if (!toast.toastId) {
      toast.toastId = Guid.newGuid();
    }

    if (!this._addToast) {
      throw new Error('No Toaster Containers have been initialized to receive toasts.');
    }

    this._addToast.next(toast);
    return toast;
  }

  /**
   * Asynchronously create and show a new toast instance.
   *
   * @param {(string | Toast)} type The type of the toast, or a Toast object.
   * @param {string=} title The toast title.
   * @param {string=} body The toast body.
   * @returns {Observable<Toast>}
   *          A hot Observable that can be subscribed to in order to receive the Toast instance
   *          with a randomly generated GUID Id.
   */
  popAsync(type: ToastType | Toast, title?: string, body?: string): Observable<Toast> {
    setTimeout(() => {
      this.pop(type, title, body);
    }, 0);

    return this.addToast;
  }

  /**
   * Clears a toast by toastId and/or toastContainerId.
   *
   * @param {string} toastId The toastId to clear.
   * @param {number=} toastContainerId
   *        The toastContainerId of the container to remove toasts from.
   */
  clear(toastId?: string, toastContainerId?: number) {
    const clearWrapper: IClearWrapper = {
      toastId: toastId, toastContainerId: toastContainerId
    };

    this._clearToasts.next(clearWrapper)
  }
}
