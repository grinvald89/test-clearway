import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ImageLoadStatusesService {
  private _loaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public get loaded$(): Observable<boolean> {
    return this._loaded$.asObservable();
  }

  public updateStatuses(): void {
    this._loaded$.next(false);

    Promise.all(
      Array
        .from(document.images)
        .filter(img => !img.complete)
        .map(img => new Promise(resolve => {
          img.onload = img.onerror = resolve;
        })))
        .then(() => {
          this._loaded$.next(true);
        }
    );
  }
}