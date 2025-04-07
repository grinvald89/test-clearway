import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { AnnotationFormComponent } from './annotation-form';
import { DocumentsService } from './documents.service';
import { ImageLoadStatusesService } from './image-load-statuses.service';
import { IDocuments, IPage, IPageView } from './model';
import { ScrollIntoPageDirective } from './scroll-into-page.directive';
import { VisiblePageDirective } from './visible-page.directive';
import { ScaleHeightDirective } from './scale-height.directive';
import { IBuildAnnotationFormParams } from './annotation-form/build-annotation-form-params.interface';
import { IAnnotationFormValue } from './annotation-form/annotation-form-value.interface';

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
  ],
  providers: [
    DocumentsService,
    ImageLoadStatusesService,
  ],
})
export class DocumentsComponent implements OnInit, AfterViewInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly documentsService = inject(DocumentsService);
  private readonly images = inject(ImageLoadStatusesService);
  private readonly router = inject(Router);
  private readonly _pages$: BehaviorSubject<IPageView[] | undefined> = new BehaviorSubject<IPageView[] | undefined>(undefined);

  public buildAnnotationFormParams!: IBuildAnnotationFormParams;
  public activePageId!: string;

  public get pages$(): Observable<IPageView[] | undefined> {
    return this._pages$.asObservable();
  }

  public ngOnInit(): void {
    this.documentsService.getDocuments()
      .pipe(
        tap(() => requestAnimationFrame(() => this.images.updateStatuses())),
      )
      .subscribe((response: IDocuments): void => {
        this._pages$.next(
          response.pages.map((item: IPage): IPageView => ({
            ...item,
            scale: 1,
            annotations: [],
          })),
        );
      });
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
    document.scale += 0.1;
  }

  public zoomOut(document: IPageView): void {
    document.scale -= 0.1;
  }

  public openAnnotationForm(event: MouseEvent, document: IPageView) {
    this.buildAnnotationFormParams = {
      absoluteCursorPosition: {
        x: event.clientX,
        y: event.clientY,
      },
      relativeCursorPosition: {
        x: event.offsetX,
        y: event.offsetY,
      },
      documentId: document.number,
    };
  }

  public createAnnotation(value: IAnnotationFormValue): void {
    const document = this._pages$.value?.find((item) => item.number === value.documentId);

    if (!document) {
      return;
    }

    document.annotations.push({
      position: {
        x: value.position.x,
        y: value.position.y,
      },
      type: value.type,
      value: value.value,
    });
  }
}