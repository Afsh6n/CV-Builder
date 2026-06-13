import { Component, input } from '@angular/core';

let uid = 0;

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.html',
  styleUrl: './form-field.css'
})
export class FormField {
  label = input<string>('');
  hint = input<string>('');
  error = input<string>('');
  required = input(false);
  inline = input(false);
  controlId = `field-${++uid}`;
}
