import { IAnnotationPosition } from '../model';

export interface IBuildAnnotationFormParams {
  readonly absoluteCursorPosition: IAnnotationPosition;
  readonly relativeCursorPosition: IAnnotationPosition;
  readonly documentId: number;
}