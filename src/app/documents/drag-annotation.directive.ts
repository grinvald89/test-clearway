import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';

@Directive({
  selector: '[appDragAnnotation]',
  standalone: true,
})
export class DragAnnotationDirective {
  @Input() annotation: any;
  @Input() page: any;
  @Input() getImageEl!: () => HTMLImageElement | null;
  @Output() annotationMoved = new EventEmitter<{ x: number; y: number }>();

  private dragState: {
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    scale: number;
    imageEl: HTMLImageElement | null;
  } | null = null;

  private readonly el = inject(ElementRef<HTMLElement>);

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.el.nativeElement.classList.add('annotation--dragging');
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
    if (!this.dragState) return;
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
    this.el.nativeElement.classList.remove('annotation--dragging');
    this.dragState = null;
  };

  private getImageWidth(imageEl: HTMLImageElement | null): number {
    return imageEl ? imageEl.naturalWidth : 1000;
  }
  private getImageHeight(imageEl: HTMLImageElement | null): number {
    return imageEl ? imageEl.naturalHeight : 1400;
  }
} 