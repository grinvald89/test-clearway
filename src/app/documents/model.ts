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
  offsetLeft: number;
  annotations: IAnnotation[];
}

export interface ICoords {
  x: number;
  y: number;
}

export interface IAnnotation {
  id: number;
  position: ICoords;
  type: AnnotationType;
  value: string;
}

export type AnnotationType = 'text' | 'icon';