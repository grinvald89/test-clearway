import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, inject, OnDestroy } from '@angular/core';

import { IAnnotation, IPageView, ICoords } from './model';

interface IDragState {
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  scale: number;
  imageEl: HTMLImageElement | null;
}

@Directive({
  selector: '[appDragAnnotation]',
  standalone: true,
})
export class DragAnnotationDirective implements OnDestroy {
  @Input() annotation!: IAnnotation;
  @Input() page!: IPageView;
  @Input() getImageEl!: () => HTMLImageElement | null;
  @Output() annotationMoved = new EventEmitter<ICoords>();

  private dragState: IDragState | null = null;

  private readonly element = inject(ElementRef);

  @HostListener('mousedown', ['$event'])
  public onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    (this.element.nativeElement as HTMLElement)
      .classList.add('annotation--dragging');

    this.dragState = {
      startX: event.clientX,
      startY: event.clientY,
      origX: this.annotation.position.x,
      origY: this.annotation.position.y,
      scale: this.page.scale,
      imageEl: this.getImageEl ? this.getImageEl() : null,
    };

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  private onMouseMove = (event: MouseEvent) => {
    if (!this.dragState) {
      return;
    }

    const dx = (event.clientX - this.dragState.startX) / this.dragState.scale;
    const dy = (event.clientY - this.dragState.startY) / this.dragState.scale;

    let newX = this.dragState.origX + dx;
    let newY = this.dragState.origY + dy;

    const imgW = this.getImageWidth(this.dragState.imageEl);
    const imgH = this.getImageHeight(this.dragState.imageEl);

    newX = Math.max(0, Math.min(newX, imgW));
    newY = Math.max(0, Math.min(newY, imgH));

    this.annotationMoved.emit({ x: newX, y: newY });
  };

  private onMouseUp = (_event: MouseEvent) => {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);

    (this.element.nativeElement as HTMLElement)
      .classList.remove('annotation--dragging');

    this.dragState = null;
  };

  public ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  private getImageWidth(imageEl: HTMLImageElement | null): number {
    return imageEl ? imageEl.naturalWidth : 1000;
  }

  private getImageHeight(imageEl: HTMLImageElement | null): number {
    return imageEl ? imageEl.naturalHeight : 1400;
  }
} 