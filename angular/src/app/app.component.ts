import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { ErrorService } from './error.service';
import { DraftService } from './draft.service';
import { ErrorTuple } from './app.types';

@Component({
    selector: 'app-root',
    imports: [
        RouterLink,
        RouterLinkActive,
        RouterOutlet,
        ErrorMessageComponent,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    title = 'Ledger';
    errorMessage = '';
    errorHttpCode = 0;
    draftCount = 0;
    draftDeletionSubscription: Subscription;

    constructor(
        private draftService: DraftService,
        private errorService: ErrorService
    ) {
        this.draftDeletionSubscription = this.draftService.draftDeleted$.subscribe(() => {
            this.draftCount--;
        });
    }

    ngOnInit() {
        this.draftService.getCount().subscribe({
            next: (count) => {
                this.draftCount = count;
            }
        });

        this.errorService.error$.subscribe((errorTuple: ErrorTuple) => {
            this.errorHttpCode = errorTuple[0].status;
            this.errorMessage = errorTuple[1] || '';
        });
    }
}
