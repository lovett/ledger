import { Component, input } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-label',
  imports: [ReactiveFormsModule],
  templateUrl: './label.component.html',
  styleUrl: './label.component.css'
})
export class LabelComponent {
  control = input<FormControl>();
  text = input<string>();
  customMessage= input<string>();

  get message() {
    const control = this.control()!;
    if (this.customMessage()) return this.customMessage();
    if (control.valid || control.untouched) return null;
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('pattern')) return 'The amount should be numeric';
    if (control.hasError('min')) return 'Value is too small';
    if (control.hasError('unique')) return 'This value is already used';
    return 'Error';
  }

  get fieldName(): string {
    const control = this.control()!;
    const parent = control.parent!;

    for (const [k, v] of Object.entries(parent.controls)) {
      if (v === control) {
        return k;
      }
    }
    return '';
  }

}
