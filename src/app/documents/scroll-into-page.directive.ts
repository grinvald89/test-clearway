import { AfterViewInit, Directive, ElementRef, inject, Injector, Input } from '@angular/core';
import { watchState } from '@ngrx/signals';

import { PAGE_ID_ATTRIBUTE, PAGE_SELECTOR } from './constants';
import { DocumentsStore } from './store';

@Directive({
  selector: '[appScrollIntoPage]',
  standalone: true,
})
export class ScrollIntoPageDirective implements AfterViewInit {
  @Input()
  public appScrollIntoPage: string = '';

  private readonly element = inject(ElementRef);
  private readonly injector = inject(Injector);
  private readonly store = inject(DocumentsStore);

  public ngAfterViewInit(): void {
    const { destroy } = watchState(this.store, (state) => {
      if (state.imagesReady) {
        this.scrollIntoPage();
        destroy();
      }
    }, { injector: this.injector });
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