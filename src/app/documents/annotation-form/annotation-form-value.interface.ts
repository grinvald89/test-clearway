import { AnnotationType, IAnnotationPosition } from '../model';

export interface IAnnotationFormValue {
  readonly documentId: number;
  readonly position: IAnnotationPosition;
  readonly type: AnnotationType;
  readonly value: string;
}