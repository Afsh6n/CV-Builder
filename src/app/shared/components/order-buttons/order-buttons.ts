import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-order-buttons',
  templateUrl: './order-buttons.html',
  styleUrl: './order-buttons.css'
})
export class OrderButtons {
  disableUp = input(false);
  disableDown = input(false);
  ariaLabel = input('تغییر ترتیب');
  moveUp = output<void>();
  moveDown = output<void>();
}
