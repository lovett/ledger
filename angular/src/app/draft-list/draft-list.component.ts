import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Observable, of, tap } from 'rxjs';
import { DraftService } from '../draft.service';
import { Draft } from '../draft';
import { ButtonComponent } from '../button/button.component';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';

@Component({
    selector: 'app-draft-list',
    imports: [
        AsyncPipe,
        DatePipe,
        ButtonComponent,
        TransactionFormComponent
    ],
    templateUrl: './draft-list.component.html',
    styleUrl: './draft-list.component.css'
})
export class DraftListComponent implements OnInit {
    private draftService = inject(DraftService);

    loading = false;
    errorMessage?: string;
    drafts$: Observable<Draft[]> = of([]);
    datetimeFormat = "EEEE MMMM d 'at' h:mm a";

    ngOnInit() {
        this.getDrafts();
    }

    getDrafts() {
        this.loading = true;
        this.drafts$ = this.draftService
            .getDrafts()
            .pipe(tap(() => (this.loading = false)));
    }

    delete(confirmed: boolean, id: number) {
        if (!confirmed) return;
        this.draftService.deleteDraft(id).subscribe({
            next: () => this.getDrafts(),
            error: (error: Error) => {
                this.errorMessage = error.message;
                console.error(error.message);
            },
        });
    }
}
