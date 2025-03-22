import { Component, output, OnDestroy, OnInit, ElementRef, viewChild } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { CurrencyPipe, DatePipe, AsyncPipe, DecimalPipe, NgTemplateOutlet, CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { TransactionService } from '../transaction.service';
import { Observable, of, map, tap } from 'rxjs';
import { Transaction } from '../transaction';
import { Paging } from '../paging';

@Component({
  selector: 'app-transaction-list',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, AsyncPipe, DecimalPipe, ButtonComponent, CommonModule],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css'
})
export class TransactionListComponent implements OnInit, OnDestroy {
  tableRef = viewChild.required<ElementRef>('tableRef');
  transactions$: Observable<Transaction[]> = of([]);

  searchForm = new FormGroup({
    query: new FormControl('')
  });

  tag = '';
  offset = 0;
  account_id = 0;
  paging: Paging;
  searching = false;
  hasPending = false;
  filterSessionKey = 'transaction-list:filters';
  selections: Transaction[] = [];
  loading = false;

  constructor(
    private transactionService: TransactionService,
    public route: ActivatedRoute,
    private router: Router,
  ) {
    this.paging = Paging.blank();

    this.transactionService.selection$.subscribe(selections => this.onSelectionChange(selections));

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
    const filters = window.sessionStorage.getItem(this.filterSessionKey) || '';
    if (window.location.search === '' && filters !== '') {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: this.querystringToParams(filters),
      });
    }

    this.route.queryParamMap.subscribe((paramMap: ParamMap) => {
      this.clearSelection();
      this.account_id = Number(paramMap.get("account_id") ?? 0);
      this.searchForm.patchValue({query: paramMap.get("query") ?? '' });
      this.tag = paramMap.get("tag") || '';
      this.searching = (this.query.value !== '');
      this.offset = Number(paramMap.get("offset") ?? 0);

      window.sessionStorage.setItem(this.filterSessionKey, window.location.search);

      this.loading = true;
      this.transactions$ = this.transactionService.getTransactions(
        this.offset,
        this.account_id,
        this.tag,
        this.query.value
      ).pipe(
        tap(() => this.loading = false),
        tap(data => this.hasPending = data[0].filter(t => !t.cleared_on).length > 0),
        tap(data => this.paging = new Paging(data[0].length, data[1], this.offset)),
        map(data => data[0])
      )
    });

  }

  ngOnDestroy() {
    // this.ledgerService.transactionSelection(null);
  }

  querystringToParams(querystring: string): Params {
    const searchParams = new URLSearchParams(querystring)
    const params: Params = {};
    searchParams.forEach((v, k) => params[k] = v);
    return params;
  }

  get query() { return this.searchForm.get("query") as FormControl }

  // getTransactions() {
  //     this.ledgerService.getTransactions(this.query.value, this.limit, this.offset, this.account, this.tag).subscribe({
  //         next: (transactionList: TransactionList) => {
  //             this.count = transactionList.count;
  //             this.transactions = transactionList.transactions.map((jsonTransaction) => {
  //                 const t = Transaction.fromJson(jsonTransaction);
  //                 const index = this.ledgerService.selections.findIndex(
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

  onSearchInput(event: Event) {
    if (this.query.value === '') {
      this.clearSearch();
    }
  }

  clearSearch(event?: Event) {
    if (event) event.preventDefault();

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

  clearTag(event: Event) {
    event.preventDefault();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {tag: null},
      queryParamsHandling: 'merge'
    });
  }

  search() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { query: this.query.value || null, offset: 0 },
      queryParamsHandling: 'merge',
    });
  }

  clearTransaction(event: MouseEvent, transaction: Transaction){
    event.preventDefault();
    transaction.cleared_on = new Date();
    this.transactionService.saveTransaction(transaction).subscribe({
      error: (error) => {
        //this.errorMessage = error.message;
        console.error(error.message);
      }
    });
  }

  /**
   * Augment the selection and broadcast the result.
   */
  toggleSelection(transaction: Transaction) {
    transaction.selected = !transaction.selected;
    this.selections.push(transaction);
    this.selections = this.selections.filter(t => t.selected);
    this.transactionService.selectionSubject.next(this.selections);
  }

  select(criteria: string, event?: MouseEvent) {
    if (event) event.preventDefault();

    let selector = '';
    if (criteria === 'all') {
      selector = 'input[type="checkbox"]';
    }

    if (criteria === 'none') {
      selector = 'input[type="checkbox"]:checked';
    }

    if (criteria === 'pending') {
      selector = 'tr.pending input[type="checkbox"]:not(:checked)';
    }

    if (criteria === 'not-pending') {
      selector = 'tr.pending input[type="checkbox"]:checked';
    }

    const checkboxes = this.tableRef().nativeElement.querySelectorAll(selector);
    checkboxes.forEach((checkbox: HTMLInputElement) => checkbox.click());
  }

  /**
   * Broadcast a selection reset that originated internally.
   */
  clearSelection(event?: MouseEvent) {
    if (event) event.preventDefault();
    this.transactionService.selectionSubject.next([]);
  }

  /**
   * React to a selection reset that originated elsewhere.
   */
  onSelectionChange(selection: Transaction[]) {
    if (selection.length === 0) {
      for (const t of this.selections) {
        t.selected = false;
      }
      this.selections = [];
    }
  }
}
