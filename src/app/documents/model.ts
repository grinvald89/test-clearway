export interface IDocuments {
  readonly name: string;
  readonly pages: IPage[];
}

export interface IDocumentsView {
  readonly name: string;
  readonly pages: IPageView[];
}

export interface IPage {
  readonly number: number;
  readonly imageUrl: string;
}

export interface IPageView extends IPage {
  scale: number;
  annotations: IAnnotation[];
}

export interface IAnnotation {
  position: IAnnotationPosition;
  type: AnnotationType;
  value: string;
}

export interface IAnnotationPosition {
  x: number;
  y: number;
}

export type AnnotationType = 'text' | 'icon';