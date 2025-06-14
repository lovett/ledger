import { Component, input } from '@angular/core';

@Component({
    selector: 'app-error-message',
    imports: [],
    templateUrl: './error-message.component.html',
    styleUrl: './error-message.component.css',
})
export class ErrorMessageComponent {
    message = input<string>('');
    httpCode = input<number>(0);
    hidden = false;

    clear(e: MouseEvent) {
        e.preventDefault();
        this.hidden = true;
    }
}
