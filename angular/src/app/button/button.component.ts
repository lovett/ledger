import { Component, input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  @Output() confirmed = new EventEmitter<string>();

  label = input<string>('Button');
  icon = input<string>();
  disabled = input<boolean>(false);
  confirmationMessage = input<string>();

  onClick(event: Event) {
    if (!this.confirmationMessage()) return;

    event.preventDefault();
    if (confirm(this.confirmationMessage())) {
      this.confirmed.emit();
    }
  }

}
