import { Component, OnDestroy } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { CurrencyPipe, DatePipe, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../transaction.service';
import { Observable } from 'rxjs';
import { Transaction } from '../transaction';
// import { Component, EventEmitter, Output } from '@angular/core';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { Transaction } from '../models/transaction';
// import { TransactionList } from '../types/TransactionList';
// import { Router, ActivatedRoute}  from '@angular/router';

@Component({
  selector: 'app-transaction-list',
  imports: [RouterLink, CurrencyPipe, DatePipe, AsyncPipe, ButtonComponent],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css'
})
export class TransactionListComponent implements OnDestroy {
  transactions$: Observable<Transaction[]>;
    // @Output() selection = new EventEmitter<Transaction>();

    // account = 0;
    // searchForm: FormGroup;
    // tag = '';
    // activeQuery= '';
    // count = 0;
    // limit = 50;
    // offset = 0;
    // nextOffset = 0;
    // previousOffset = 0;
    // transactions: Transaction[] = [];
    // singularResourceName: string;

    constructor(
      private transactionService: TransactionService
    //     private formBuilder: FormBuilder,
    //     private router: Router,
    //     private route: ActivatedRoute,
    ) {
      this.transactions$ = this.transactionService.getTransactions();

    //     this.searchForm = this.formBuilder.group({
    //         query: [
    //             '',
    //             {validators: Validators.required}
    //         ],
    //     });

    //     this.route.queryParams.subscribe((queryParams) => {
    //         this.account = Number(queryParams['account'] || 0);
    //         this.offset = Number(queryParams['offset'] || 0);
    //         this.tag = queryParams['tag'];
    //         this.query.setValue(queryParams['q']);
    //         this.activeQuery = queryParams['q'];
    //         this.getTransactions();
    //         window.scrollTo(0, 0);
    //     });

    }

    ngOnDestroy() {
      // this.ledgerService.transactionSelection(null);
    }

    // get query() {
    //     return this.searchForm.controls['query'];
    // }

    // getTransactions() {
    //     this.ledgerService.getTransactions(this.query.value, this.limit, this.offset, this.account, this.tag).subscribe({
    //         next: (transactionList: TransactionList) => {
    //             this.count = transactionList.count;
    //             this.transactions = transactionList.transactions.map((jsonTransaction) => {
    //                 const t = Transaction.fromJson(jsonTransaction);
    //                 const index = this.ledgerService.selectedTransactions.findIndex(
    //                     selectedTransaction => selectedTransaction.uid === t.uid
    //                 );

    //                 t.selected = index > -1;
    //                 return t;
    //             });
    //             this.nextOffset = Math.min(this.offset + this.transactions.length, this.count);
    //             this.previousOffset = Math.max(0, this.offset - this.transactions.length);
    //         },
    //         error: (err: Error) => console.log(err),
    //     });
    // }

    // clearSearch(event: Event) {
    //     event.preventDefault();
    //     this.ledgerService.clearSelections();
    //     this.searchForm.patchValue({query: ''});
    //     this.router.navigate([], {
    //         relativeTo: this.route,
    //         queryParams: {q: null, tag: null, offset: null },
    //         queryParamsHandling: 'merge',
    //     });
    // }

    // search() {
    //     this.router.navigate([], {
    //         relativeTo: this.route,
    //         queryParams: { q: this.query.value, offset: 0 },
    //         queryParamsHandling: 'merge',
    //     });
    // }

    clearTransaction(event: MouseEvent, transaction: Transaction){
    //     event.preventDefault();
    //     transaction.cleared_on = new Date();
    //     this.ledgerService.saveTransaction(transaction).subscribe({
    //         error: (err: Error) => console.log(err),
    //     });
    }

    toggleSelection(event: MouseEvent, transaction: Transaction) {
        // const target = event.target as HTMLElement;
        // if (target.tagName === 'A') {
        //     return;
        // }
        // transaction.selected = !transaction.selected;
        // this.ledgerService.transactionSelection(transaction);
    }
}
