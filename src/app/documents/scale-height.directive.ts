import { AfterViewInit, Directive, ElementRef, inject, Input } from '@angular/core';
import { filter, first } from 'rxjs';

import { ImageLoadStatusesService } from './image-load-statuses.service';

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
  private readonly images = inject(ImageLoadStatusesService);

  private _appScaleHeight: number = 0;
  private imagesLoaded: boolean = false;
  private pageHeightOrigin: number = 0;

  private get $page(): HTMLInputElement {
    return this.element.nativeElement;
  }

  public ngAfterViewInit(): void {
    this.images.loaded$
      .pipe(
        filter((val) => val),
        first(),
      )
      .subscribe((): void => {
        this.pageHeightOrigin = this.$page.clientHeight;
        this.imagesLoaded = true;
        this.changeHeight();
      });
  }

  private changeHeight(): void {
    if (!this.imagesLoaded) {
      return;
    }
  
    this.$page.style.height = this.pageHeightOrigin * this._appScaleHeight + 'px';
  }
}
