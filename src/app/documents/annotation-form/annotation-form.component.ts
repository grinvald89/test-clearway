import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostBinding, HostListener, inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

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
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
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

  private readonly changeDetector = inject(ChangeDetectorRef);

  public image: string | null = null;
  public fileName: string | null = null;
  public isImageLoading: boolean = false;

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

    if (this.type === 'icon' && !this.image) {
      return true;
    }

    return false;
  }

  public saveForm() {
    if (this.invalidForm) {
      return;
    }

    const value: string = this.type === 'text' ? this.form.value.comment : this.image;

    this.formValue.emit({
      documentId: this._buildFormParams.documentId,
      position: {
        x: this._buildFormParams.relativeCursorPosition.x,
        y: this._buildFormParams.relativeCursorPosition.y,
      },
      type: this.type ?? 'text',
      value: value,
    });

    this.closeForm();
  }

  public onIconChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.fileName = file.name;
      this.isImageLoading = true;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.image = e.target?.result as string;
        this.isImageLoading = false;
        this.changeDetector.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  private openForm(): void {
    this.type = null;
    this.visible = true;
  }

  private closeForm(): void {
    this.form.reset();
    this.fileName = null;
    this.visible = false;
  }

  public setType(type: 'text' | 'icon'): void {
    this.type = type;
    this.form = new FormGroup({
      comment: new FormControl('', type === 'text' ? Validators.required : null),
      icon: new FormControl(null, type === 'icon' ? Validators.required : null),
    });
  }
}