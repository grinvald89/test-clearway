import { Directive, ElementRef, EventEmitter, inject, Output } from '@angular/core';

import { PAGE_ID_ATTRIBUTE, PAGE_SELECTOR } from './constants';

@Directive({
  selector: '[appVisiblePage]',
  standalone: true,
})
export class VisiblePageDirective {
  @Output()
  public appVisiblePage: EventEmitter<string> = new EventEmitter<string>();

  private readonly element = inject(ElementRef);

  public ngAfterViewInit(): void {
    this.element.nativeElement.addEventListener('scroll', (event: any) => this.scrollHandler());
  }

  private scrollHandler(): void {
    const elements: HTMLInputElement[] = this.element.nativeElement.querySelectorAll(PAGE_SELECTOR);

    if (elements.length === 0) {
      return;
    }

    let activePageId: string = elements[0].getAttribute(PAGE_ID_ATTRIBUTE) ?? '';

    for(const $item of elements) {
      if ($item.getBoundingClientRect().top >= 0) {
        break;
      }

      activePageId = $item.getAttribute(PAGE_ID_ATTRIBUTE) ?? '';
    }

    this.appVisiblePage.emit(activePageId);
  }
}