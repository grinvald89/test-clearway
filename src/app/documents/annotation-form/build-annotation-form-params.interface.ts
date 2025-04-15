import { ICoords } from '../model';

export interface IBuildAnnotationFormParams {
  readonly absoluteCursorPosition: ICoords;
  readonly relativeCursorPosition: ICoords;
  readonly documentId: number;
}