import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { TransactionService } from '../transaction.service';
import { Transaction } from '../transaction';

@Component({
  selector: 'app-selection-summary',
  imports: [CurrencyPipe, CommonModule],
  templateUrl: './selection-summary.component.html',
  styleUrl: './selection-summary.component.css'
})
export class SelectionSummaryComponent implements OnInit {
  amount: number = 0;
  count: number = 0;

  constructor(
    private transactionService: TransactionService,
  ) {}

  ngOnInit() {
    this.transactionService.selection$.subscribe(selection => {
      this.amount = 0;
      this.count = selection.length;

      for (const t of selection) {
        this.amount += t.amount;
      }
    });
  }

  clear(e: MouseEvent) {
    e.preventDefault();
    this.transactionService.selectionSubject.next([]);
  }
}
