import { AfterViewInit, Directive, ElementRef, EventEmitter, inject, Injector, OnDestroy, Output } from '@angular/core';
import { watchState } from '@ngrx/signals';

import { PAGE_ID_ATTRIBUTE, PAGE_SELECTOR } from './constants';
import { DocumentsStore } from './store';

@Directive({
  selector: '[appVisiblePage]',
  standalone: true,
})
export class VisiblePageDirective implements AfterViewInit, OnDestroy {
  @Output()
  public appVisiblePage: EventEmitter<string> = new EventEmitter<string>();

  private readonly element = inject(ElementRef);
  private readonly injector = inject(Injector);
  private readonly store = inject(DocumentsStore);

  private readonly scrollHandlerFn = (event: MouseEvent) => this.scrollHandler();

  public ngAfterViewInit(): void {
    const { destroy } = watchState(this.store, (state) => {
      if (state.imagesReady) {
        this.element.nativeElement.addEventListener('scroll', this.scrollHandlerFn);
        destroy();
      }
    }, { injector: this.injector });
  }

  public ngOnDestroy(): void {
    this.element.nativeElement.removeEventListener('scroll', this.scrollHandlerFn);
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