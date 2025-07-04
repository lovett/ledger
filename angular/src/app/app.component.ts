import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { SelectionSummaryComponent } from './selection-summary/selection-summary.component';
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
        SelectionSummaryComponent,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    title = 'Ledger';
    errorMessage = '';
    errorHttpCode = 0;
    noDraftsAvailable = true;

    constructor(
        private draftService: DraftService,
        private errorService: ErrorService
    ) {}

    ngOnInit() {
        this.draftService.getCount().subscribe({
            next: (count) => {
                this.noDraftsAvailable = count == 0;
            }
        });

        this.errorService.error$.subscribe((errorTuple: ErrorTuple) => {
            this.errorHttpCode = errorTuple[0].status;
            this.errorMessage = errorTuple[1] || '';
        });
    }
}
