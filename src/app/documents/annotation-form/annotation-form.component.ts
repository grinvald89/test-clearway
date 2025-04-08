import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';

import { AnnotationType } from '../model';
import { IBuildAnnotationFormParams } from './build-annotation-form-params.interface';
import { IAnnotationFormValue } from './annotation-form-value.interface';

@Component({
  selector: 'app-annotation-form',
  templateUrl: './annotation-form.component.html',
  styleUrls: ['./annotation-form.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationFormComponent {
  private _buildFormParams!: IBuildAnnotationFormParams;

  @Input()
  public set buildFormParams(value: IBuildAnnotationFormParams) {
    if (value === undefined) {
      return;
    }

    this._buildFormParams = value;
    this.openForm();
  }

  @Output()
  public formValue: EventEmitter<IAnnotationFormValue> = new EventEmitter<IAnnotationFormValue>();

  @HostBinding('style.left.px') public get left(): number {
    return this._buildFormParams?.absoluteCursorPosition.x ?? 0;
  }

  @HostBinding('style.top.px') public get top(): number {
    return this._buildFormParams?.absoluteCursorPosition.y ?? 0;
  }

  @HostBinding('hidden') public get hostClass(): boolean {
    return !this.visible;
  }

  @HostListener('document:keydown', ['$event'])
  public handleKeyboardEvent(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        this.closeForm();
      }
  }
  
  public form: FormGroup = new FormGroup({
    comment: new FormControl('', Validators.required),
    icon: new FormControl(null, Validators.required),
  });

  public type: AnnotationType | null = null;
  public visible: boolean = false;

  public get invalidForm(): boolean {
    if (this.type === 'text' && this.form.controls['comment'].invalid) {
      return true;
    }

    if (this.type === 'icon' && this.form.controls['icon'].invalid) {
      return true;
    }

    return false;
  }

  public saveForm() {
    if (this.invalidForm) {
      return;
    }

    this.formValue.emit({
      documentId: this._buildFormParams.documentId,
      position: {
        x: this._buildFormParams.relativeCursorPosition.x,
        y: this._buildFormParams.relativeCursorPosition.y,
      },
      type: this.type ?? 'text',
      value: this.form.value.comment,
    });

    this.closeForm();
  }

  private openForm(): void {
    this.type = null;
    this.visible = true;
  }

  private closeForm(): void {
    this.form.reset();
    this.visible = false;
  }
}