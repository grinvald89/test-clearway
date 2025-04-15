import { afterNextRender, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { watchState } from '@ngrx/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AnnotationFormComponent } from './annotation-form';
import { DocumentsService } from './services/documents.service';
import { IPageView } from './model';
import { ScrollIntoPageDirective } from './scroll-into-page.directive';
import { VisiblePageDirective } from './visible-page.directive';
import { ScaleHeightDirective } from './scale-height.directive';
import { IBuildAnnotationFormParams } from './annotation-form/build-annotation-form-params.interface';
import { IAnnotationFormValue } from './annotation-form/annotation-form-value.interface';
import { DocumentsStore } from './store';
import { DragAnnotationDirective } from './drag-annotation.directive';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AnnotationFormComponent,
    CommonModule,
    RouterModule,
    ScaleHeightDirective,
    ScrollIntoPageDirective,
    VisiblePageDirective,
    MatButtonModule,
    MatIconModule,
    DragAnnotationDirective,
  ],
  providers: [
    DocumentsService,
    DocumentsStore,
  ],
})
export class DocumentsComponent implements OnInit, AfterViewInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly element = inject(ElementRef);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  public readonly store = inject(DocumentsStore);

  public buildAnnotationFormParams!: IBuildAnnotationFormParams;
  public activePageId!: string;

  public ngOnInit(): void {
    this.store.loadDocumnets(null);

    watchState(this.store, (state) => {
      if (state.action === 'loadDocumnets') {
        afterNextRender(() => {
          this.store.updateImageStatuses(null);
        }, { injector: this.injector });
      }

      if (state.action === 'updateImageStatuses') {
        afterNextRender(() => {
          this.updateOffsetForImages();
        }, { injector: this.injector });
      }

      if (state.action === 'zoomInPage' || state.action === 'zoomOutPage') {
        afterNextRender(() => {
          this.updateOffsetForImages();
        }, { injector: this.injector });
      }

      if (state.action === 'updateOffsetForImages') {
          this.changeDetector.detectChanges();
      }
    }, { injector: this.injector });
  }

  public ngAfterViewInit(): void {
    this.activePageId = this.activatedRoute.snapshot.queryParamMap.get('id') ?? '';
  }

  public changeActivePageId(pageId: string): void {
    if (this.activePageId === pageId) {
      return;
    }

    this.activePageId = pageId;

    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: { id: pageId },
        queryParamsHandling: 'merge',
      }
    );
  }

  public zoomIn(document: IPageView): void {
    this.store.zoomInPage(document.number);
  }

  public zoomOut(document: IPageView): void {
    this.store.zoomOutPage(document.number);
  }

  public openAnnotationForm(event: MouseEvent, document: IPageView) {
    this.buildAnnotationFormParams = {
      absoluteCursorPosition: {
        x: event.clientX,
        y: event.clientY,
      },
      relativeCursorPosition: {
        x: event.offsetX / document.scale,
        y: event.offsetY / document.scale,
      },
      documentId: document.number,
    };
  }

  public createAnnotation(formValue: IAnnotationFormValue): void {
    this.store.createAnnotation(
      formValue.documentId,
      formValue.position,
      formValue.type,
      formValue.value,
    );
  }

  public deleteAnnotation(
    pageId: number,
    annotationId: number,
  ): void {
    this.store.deleteAnnotation(pageId, annotationId);
  }

  public save(): void {
    console.log(this.store.pages());
  }

  private updateOffsetForImages(): void {
    const $images: HTMLElement[] = this.element.nativeElement.querySelectorAll('img.document__image');
    const pages: IPageView[] = this.store.pages();

    for(const [index, $img] of $images.entries()) {
      pages[index].offsetLeft = $img.offsetLeft;
    }

    this.store.updateOffsetForImages(pages);
  }

  public onAnnotationMoved(annotation: any, coords: { x: number; y: number }) {
    annotation.position.x = coords.x;
    annotation.position.y = coords.y;
    this.changeDetector.detectChanges();
  }

  public getImageElementForPage(pageNumber: number): HTMLImageElement | null {
    return this.element.nativeElement.querySelector(
      `.document[page-id="${pageNumber}"] .document__image`
    );
  }

  public getImageElForPage(pageNumber: number): () => HTMLImageElement | null {
    return () => this.getImageElementForPage(pageNumber);
  }
}