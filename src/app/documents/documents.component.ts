import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map, Observable, tap } from 'rxjs';

import { DocumentsService } from './documents.service';
import { ImageLoadStatusesService } from './image-load-statuses.service';
import { IDocuments, IPage, IPageView } from './model';
import { ScrollIntoPageDirective } from './scroll-into-page.directive';
import { VisiblePageDirective } from './visible-page.directive';
import { ScaleHeightDirective } from './scale-height.directive';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ScrollIntoPageDirective,
    VisiblePageDirective,
    ScaleHeightDirective,
  ],
  providers: [
    DocumentsService,
    ImageLoadStatusesService,
  ],
})
export class DocumentsComponent implements AfterViewInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly documentsService = inject(DocumentsService);
  private readonly images = inject(ImageLoadStatusesService);
  private readonly router = inject(Router);

  public activePageId!: string;

  public pages$: Observable<IPageView[]> = this.documentsService.getDocuments().pipe(
    tap(() => requestAnimationFrame(() => this.images.updateStatuses())),
    map((response: IDocuments): IPageView[] => {
      return response.pages.map((item: IPage): IPageView => ({
        ...item,
        scale: 1,
      }));
    }));

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
}