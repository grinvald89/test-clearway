import { AnnotationType, ICoords } from '../model';

export interface IAnnotationFormValue {
  readonly documentId: number;
  readonly position: ICoords;
  readonly type: AnnotationType;
  readonly value: string;
}