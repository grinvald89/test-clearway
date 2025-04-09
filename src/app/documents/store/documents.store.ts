import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { map, pipe, switchMap, tap, zip } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

import { DocumentsService } from '../services';
import { AnnotationType, IAnnotation, IAnnotationPosition, IDocuments, IPage, IPageView } from '../model';

interface IDocumentsState {
  action: string;
  imagesReady: boolean;
  loading: boolean;
  pages: IPageView[];
};

const initialState: IDocumentsState = {
  action: 'Initial',
  imagesReady: false,
  loading: true,
  pages: [],
};

export const DocumentsStore = signalStore(
  withState(initialState),
  withProps(() => ({
    documentsService: inject(DocumentsService),
  })),
  withMethods(({ documentsService, ...store }) => ({
    /**
     * Загрузить список документов
     */
    loadDocumnets: rxMethod(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() => {
          return documentsService.getDocuments().pipe(
            map((response: IDocuments): IPageView[] => {
              return response.pages.map((item: IPage): IPageView => ({
                ...item,
                annotations: [],
                offsetLeft: 0,
                scale: 1,
              }))
            }),
            tapResponse({
              next: (pages) => patchState(store, {
                action: 'loadDocumnets',
                loading: false,
                pages,
              }),
              error: (error) => {
                console.error(error)
              },
            }),
          )
        }),
      ),
    ),

    /**
     * Обновить статус изображений
     */
    updateImageStatuses: rxMethod(
      pipe(
        switchMap(() => {
          return zip(
            ...Array
              .from(document.images)
              .filter(img => !img.complete)
              .map(img => new Promise(resolve => {
                img.onload = img.onerror = resolve;
              }))
            )
            .pipe(
              tapResponse({
                next: () => patchState(store, {
                  action: 'updateImageStatuses',
                  imagesReady: true,
                }),
                error: (error) => {
                  console.error(error)
                },
              }),
            )
        }),
      ),
    ),

    /**
     * Увеличить страницу
     */
    zoomInPage: (pageId: number) => {
      patchState(store, (state) => {
        const page = state.pages.find((item) => item.number === pageId);

        if (page === undefined) {
          return state;
        }

        page.scale += 0.1;

        return {
          action: 'zoomInPage',
          pages: state.pages,
        };
      });
    },

    /**
     * Уменьшить страницу
     */
    zoomOutPage: (pageId: number) => {
      patchState(store, (state) => {
        const page = state.pages.find((item) => item.number === pageId);

        if (page === undefined) {
          return state;
        }

        page.scale -= 0.1;

        return {
          action: 'zoomOutPage',
          pages: state.pages,
        };
      });
    },

    /**
     * Создать аннотацию
     */
    createAnnotation: (
      pageId: number,
      position: IAnnotationPosition,
      type: AnnotationType,
      value: string
    ) => {
      patchState(store, (state) => {
        const page = state.pages.find((item) => item.number === pageId);

        if (page === undefined) {
          return state;
        }

        page.annotations.push({
          id: Date.now(),
          position: {
            x: position.x,
            y: position.y,
          },
          type: type,
          value: value,
        });

        return {
          action: 'createAnnotation',
          pages: state.pages,
        };
      });
    },

    /**
     * Удалить аннотацию
     */
    deleteAnnotation: (
      pageId: number,
      annotationId: number,
    ) => {
      patchState(store, (state) => {
        const page = state.pages.find((item) => item.number === pageId);

        if (page === undefined) {
          return state;
        }

        page.annotations =
          page.annotations.filter((item: IAnnotation): boolean => item.id !== annotationId);

        return {
          action: 'deleteAnnotation',
          pages: state.pages,
        };
      });
    },

    /**
     * Обновить отступы для картинок
     */
    updateOffsetForImages: (pages: IPageView[]) => {
      patchState(store, (state) => {
        const pagesOrigin = state.pages;

        if (pages.length !== pagesOrigin.length) {
          return state;
        }

        for(const page of pages) {
          const pageOrigin = state.pages.find((item) => item.number === page.number);

          if (pageOrigin === undefined) {
            return state;
          }

          pageOrigin.offsetLeft = page.offsetLeft;
        }

        return {
          action: 'updateOffsetForImages',
          pages: state.pages,
        };
      });
    },
  })),
);