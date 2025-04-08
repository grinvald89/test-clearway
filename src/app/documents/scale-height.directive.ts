import { AfterViewInit, Directive, ElementRef, inject, Injector, Input } from '@angular/core';
import { watchState } from '@ngrx/signals';

import { DocumentsStore } from './store';

@Directive({
  selector: '[appScaleHeight]',
  standalone: true,
})
export class ScaleHeightDirective implements AfterViewInit {
  @Input()
  public set appScaleHeight(value: number) {
    this._appScaleHeight = value;
    this.changeHeight();
  }

  private readonly element = inject(ElementRef);
  private readonly injector = inject(Injector);
  private readonly store = inject(DocumentsStore);

  private _appScaleHeight: number = 0;
  private pageHeightOrigin: number = 0;

  private get $page(): HTMLInputElement {
    return this.element.nativeElement;
  }

  public ngAfterViewInit(): void {
    const { destroy } = watchState(this.store, (state) => {
      if (state.imagesReady) {
        this.pageHeightOrigin = this.$page.clientHeight;
        this.changeHeight();
        destroy();
      }
    }, { injector: this.injector });
  }

  private changeHeight(): void {
    if (!this.store.imagesReady()) {
      return;
    }
  
    this.$page.style.height = this.pageHeightOrigin * this._appScaleHeight + 'px';
  }
}
