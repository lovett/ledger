import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { TransactionService } from '../transaction.service';

@Component({
    selector: 'app-selection-summary',
    imports: [CurrencyPipe, CommonModule],
    templateUrl: './selection-summary.component.html',
    styleUrl: './selection-summary.component.css',
})
export class SelectionSummaryComponent implements OnInit {
    private transactionService = inject(TransactionService);

    amount = 0;
    count = 0;

    ngOnInit() {
        this.transactionService.selection$.subscribe((selection) => {
            this.amount = 0;
            this.count = selection.length;

            for (const t of selection) {
                this.amount += t.amount;
            }
        });
    }
}
