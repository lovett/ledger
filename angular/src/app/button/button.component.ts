import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  readonly confirmed = output<boolean>();

  type = input<string>('');
  label = input<string>('Button');
  icon = input<string>();
  disabled = input<boolean>(false);
  confirmationMessage = input<string>();

  onClick(event: Event) {
    if (!this.confirmationMessage()) return;

    event.preventDefault();
    if (confirm(this.confirmationMessage())) {
      this.confirmed.emit(true);
    } else {
      this.confirmed.emit(false);
    }
  }

}
