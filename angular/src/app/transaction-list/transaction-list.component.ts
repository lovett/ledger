import {
    Component,
    output,
    OnDestroy,
    OnInit,
    ElementRef,
    viewChild,
} from '@angular/core';
import {
    ReactiveFormsModule,
    FormGroup,
    FormControl,
    Validators,
} from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import {
    CurrencyPipe,
    DatePipe,
    AsyncPipe,
    DecimalPipe,
    NgTemplateOutlet,
    CommonModule,
} from '@angular/common';
import {
    RouterLink,
    Router,
    ActivatedRoute,
    Params,
    ParamMap,
} from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TransactionService } from '../transaction.service';
import { Observable, Subscription, of, map, tap, catchError } from 'rxjs';
import { Transaction } from '../transaction';
import { Paging } from '../paging';
import { TransactionFilter, TransactionQueryParams } from '../app.types';
import { ErrorService } from '../error.service';

type FilterTuple = [string, string];

@Component({
    selector: 'app-transaction-list',
    imports: [
        ReactiveFormsModule,
        RouterLink,
        CurrencyPipe,
        DatePipe,
        AsyncPipe,
        DecimalPipe,
        ButtonComponent,
        CommonModule,
    ],
    templateUrl: './transaction-list.component.html',
    styleUrl: './transaction-list.component.css',
})
export class TransactionListComponent implements OnInit, OnDestroy {
    tableRef = viewChild.required<ElementRef>('tableRef');
    transactions$: Observable<Transaction[]> = of([]);

    searchForm = new FormGroup({
        query: new FormControl(''),
    });

    paging: Paging = Paging.blank();
    hasPending = false;
    selections: Transaction[] = [];
    loading = false;
    filters: FilterTuple[] = [];
    canRestorePreviousFilter = false;
    selectionSubscription?: Subscription;

    constructor(
        private transactionService: TransactionService,
        private errorService: ErrorService,
        public route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit() {
        this.selectionSubscription =
            this.transactionService.selection$.subscribe((selections) =>
                this.onSelectionChange(selections),
            );

        const filters = this.transactionService.recallStoredFilters();
        if (Object.keys(filters).length > 0) {
            this.transactionService.clearPreviousFilter();
            this.canRestorePreviousFilter = false;
        } else {
            this.canRestorePreviousFilter = this.transactionService.canRestorePreviousFilter();
        }

        if (window.location.search === '' && Object.keys(filters).length > 0) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: filters,
            });
        }

        this.route.queryParamMap.subscribe((paramMap: ParamMap) => {
            this.clearSelection();
            this.searchForm.patchValue({ query: paramMap.get('query') ?? '' });

            this.loading = true;
            this.transactions$ = this.transactionService
                .getTransactions(
                    Number(paramMap.get('offset') ?? 0),
                    Number(paramMap.get('account_id') ?? 0),
                    paramMap.get('tag') || '',
                    this.query.value,
                )
                .pipe(
                    catchError((error: HttpErrorResponse) => {
                        this.loading = false;
                        this.transactionService.clearStoredFilters();
                        this.errorService.reportError(error);
                        return of([]);
                    }),
                    tap((data) => {
                        this.loading = false;
                        this.transactionService.storeFilters(
                            window.location.search,
                        );
                        if (data.length > 0) {
                            this.hasPending =
                                data[0].filter((t) => !t.cleared_on).length > 0;
                            this.paging = new Paging(
                                data[0].length,
                                data[1],
                                data[2]?.offset || 0,
                            );
                            this.setFilters(data[2]);
                        }
                    }),
                    map((data) => (data.length > 0 ? data[0] : [])),
                );
        });
    }

    ngOnDestroy() {
        this.clearSelection();
        if (this.selectionSubscription) {
            this.selectionSubscription.unsubscribe();
        }
    }

    get query() {
        return this.searchForm.get('query') as FormControl;
    }

    onSearchInput(event: Event) {
        if (this.query.value === '') {
            this.clearFilter('search');
        }
    }

    restoreFilters(event?: Event) {
        if (event) event.preventDefault();
        this.transactionService.restorePreviousFilter();
        const filters = this.transactionService.recallStoredFilters();
        this.canRestorePreviousFilter = false;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: filters,
        });
    }

    clearFilter(name: string, event?: Event) {
        if (event) event.preventDefault();

        const queryParams: TransactionQueryParams = { offset: null };
        if (name === 'search' || name === 'all') {
            queryParams.query = null;
        }

        if (name === 'account' || name === 'all') {
            queryParams.account_id = null;
        }

        if (name === 'tag' || name === 'all') {
            queryParams.tag = null;
        }

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams,
            queryParamsHandling: 'merge',
        });
    }

    search() {
        this.transactionService.clearPreviousFilter();
        this.canRestorePreviousFilter = false;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { query: this.query.value || null, offset: 0 },
            queryParamsHandling: 'merge',
        });
    }

    clearTransaction(event: MouseEvent, transaction: Transaction) {
        event.preventDefault();
        transaction.cleared_on = new Date();
        this.transactionService.saveTransaction(transaction).subscribe({
            next: () => {
                if (transaction.selected) this.deselect(transaction);
            },
            error: (error) => {
                transaction.cleared_on = undefined;
                this.errorService.reportError(
                    error,
                    'The transaction was not cleared.',
                );
            },
        });
    }

    /**
     * Augment the selection and broadcast the result.
     */
    toggleSelection(transaction: Transaction) {
        transaction.selected = !transaction.selected;
        this.selections.push(transaction);
        this.selections = this.selections.filter((t) => t.selected);
        this.transactionService.selectionSubject.next(this.selections);
    }

    deselect(transaction: Transaction) {
        transaction.selected = false;
        this.selections = this.selections.filter((t) => t.selected);
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

        const checkboxes =
            this.tableRef().nativeElement.querySelectorAll(selector);
        for (const checkbox of checkboxes) {
            checkbox.click();
        }
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

    setFilters(filter?: TransactionFilter) {
        this.filters = [];
        if (!filter) return;

        if (filter.search) {
            this.filters.push(['search', filter.search]);
        }

        if (filter.tag) {
            this.filters.push(['tag', filter.tag]);
        }

        if (filter.account) {
            this.filters.push(['account', filter.account.name]);
        }
    }
}
