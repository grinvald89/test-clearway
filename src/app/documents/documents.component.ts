import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map, Observable } from 'rxjs';

import { DocumentsService } from './documents.service';
import { IDocuments, IPage } from './model';
import { ScrollIntoPageDirective } from './scroll-into-page.directive';
import { VisiblePageDirective } from './visible-page.directive';

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
  ],
  providers: [DocumentsService],
})
export class DocumentsComponent implements AfterViewInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly documentsService = inject(DocumentsService);
  private readonly router = inject(Router);

  public activePageId!: string;

  public pages$: Observable<IPage[]> = this.documentsService.getDocuments().pipe(
    map((response: IDocuments): IPage[] => response.pages));

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
}