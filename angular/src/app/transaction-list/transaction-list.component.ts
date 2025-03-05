import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { CurrencyPipe, DatePipe, AsyncPipe, DecimalPipe } from '@angular/common';
import { RouterLink, Router, ActivatedRoute, ParamMap } from '@angular/router';
import { TransactionService } from '../transaction.service';
import { Observable, of, map, tap } from 'rxjs';
import { Transaction } from '../transaction';
import { Paging } from '../paging';
// import { Component, EventEmitter, Output } from '@angular/core';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { Transaction } from '../models/transaction';
// import { TransactionList } from '../types/TransactionList';
// import { Router, ActivatedRoute}  from '@angular/router';

@Component({
  selector: 'app-transaction-list',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, AsyncPipe, DecimalPipe, ButtonComponent],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css'
})
export class TransactionListComponent implements OnInit, OnDestroy {
  transactions$: Observable<Transaction[]> = of([]);
  // @Output() selection = new EventEmitter<Transaction>();

  searchForm = new FormGroup({
    query: new FormControl('')
  });

  // tag = '';
  offset = 0;
  account_id = 0;
  paging: Paging;
  title = 'Transactions';
  // transactions: Transaction[] = [];
  // singularResourceName: string;

  constructor(
    private transactionService: TransactionService,
    private route: ActivatedRoute,
    //     private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.paging = Paging.blank();

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

  ngOnInit() {
    this.route.queryParamMap.subscribe((paramMap: ParamMap) => {
      this.offset = Number(paramMap.get("offset") ?? 0);
      this.account_id = Number(paramMap.get("account_id") ?? 0);
      this.searchForm.patchValue({query: paramMap.get("query") ?? '' });

      this.transactions$ = this.transactionService.getTransactions(
        this.offset,
        this.account_id,
        this.query.value
      ).pipe(
        tap(data => this.paging = new Paging(data[0].length, data[1], this.offset)),
        tap(data => this.title = data[2]),
        map(data => data[0])
      )
    });
  }

  ngOnDestroy() {
    // this.ledgerService.transactionSelection(null);
  }

  get query() { return this.searchForm.get("query") as FormControl }

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

  clearSearch(event: Event) {
      event.preventDefault();
      // this.ledgerService.clearSelections();
      this.searchForm.patchValue({query: ''});
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {query: null, tag: null, offset: null },
        queryParamsHandling: 'merge',
      });
  }

  clearAccount(event: Event) {
    event.preventDefault();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {account_id: null, offset: null},
      queryParamsHandling: 'merge'
    });
  }

  search() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { query: this.query.value, offset: 0 },
      queryParamsHandling: 'merge',
    });
  }

  clearTransaction(event: MouseEvent, transaction: Transaction){
    event.preventDefault();
    transaction.cleared_on = new Date();
    this.transactionService.saveTransaction(transaction).subscribe({
      error: (error) => {
        this.errorMessage = error.message;
        console.error(error.message);
      }
    });
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
