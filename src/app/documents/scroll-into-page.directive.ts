import { AfterViewInit, Directive, ElementRef, inject, Input } from '@angular/core';
import { filter, first } from 'rxjs';

import { PAGE_ID_ATTRIBUTE, PAGE_SELECTOR } from './constants';
import { ImageLoadStatusesService } from './image-load-statuses.service';

@Directive({
  selector: '[appScrollIntoPage]',
  standalone: true,
})
export class ScrollIntoPageDirective implements AfterViewInit {
  @Input()
  public appScrollIntoPage: string = '';

  private readonly element = inject(ElementRef);
  private readonly images = inject(ImageLoadStatusesService);

  public ngAfterViewInit(): void {
    this.images.loaded$
      .pipe(
        filter((val) => val),
        first(),
      )
      .subscribe((): void => {
        this.scrollIntoPage();
      });
  }

  private scrollIntoPage(): void {
    if (this.appScrollIntoPage.length === 0) {
      return;
    }

    const elements: HTMLInputElement[] = this.element.nativeElement.querySelectorAll(PAGE_SELECTOR);

    if (elements.length === 0) {
      return;
    }

    for (const $item of elements) {
      let activePageId: string = $item.getAttribute(PAGE_ID_ATTRIBUTE) ?? '';

      if (activePageId === this.appScrollIntoPage) {
        const scrollPosition: number = $item.getBoundingClientRect().top + 1;
        this.element.nativeElement.scrollTo({
          top: scrollPosition,
          behavior: 'smooth',
        });

        break;
      }
    }
  }
}