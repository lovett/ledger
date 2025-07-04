import { Component, input, OnInit, ElementRef, viewChild } from '@angular/core';
import {
    ReactiveFormsModule,
    FormArray,
    FormGroup,
    FormControl,
    FormBuilder,
    Validators,
    AbstractControl,
    ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CurrencyPipe, DatePipe, AsyncPipe, formatDate } from '@angular/common';
import { Transaction } from '../transaction';
import { Account } from '../account';
import { Tag } from '../tag';
import { TransactionService } from '../transaction.service';
import { TagService } from '../tag.service';
import { Observable, switchMap, debounceTime, of, catchError, map } from 'rxjs';
import { ButtonComponent } from '../button/button.component';
import { AccountMenuComponent } from '../account-menu/account-menu.component';
import { LabelComponent } from '../label/label.component';

function atLeastOneAccount(group: AbstractControl): ValidationErrors | null {
    const a1 = group.get('account_id');
    const a2 = group.get('destination_id');
    if (!a1 || !a2) return null;
    if (a1.pristine && a2.pristine) return null;
    if (a1.value || a2.value) return null;
    return { atLeastOneAccount: 'Specify at least one account' };
}

function dateRange(group: AbstractControl): ValidationErrors | null {
    // const occurredOn = group.get('occurred_on')!.value;
    // const clearedOn = group.get('cleared_on')!.value;

    // if (!clearedOn) {
    //     return null;
    // }

    // if (clearedOn >= occurredOn) {
    //     return null;
    // }

    return { daterange: true };
}

@Component({
    selector: 'app-transaction-form',
    imports: [
        ReactiveFormsModule,
        ButtonComponent,
        AccountMenuComponent,
        LabelComponent,
        RouterLink,
        CurrencyPipe,
        DatePipe,
        AsyncPipe,
    ],
    templateUrl: './transaction-form.component.html',
    styleUrl: './transaction-form.component.css',
})
export class TransactionFormComponent implements OnInit {
    tagsRef = viewChild.required<ElementRef>('tagsRef');
    transaction?: Transaction;
    errorMessage?: string;
    datesExpanded = false;
    receipt_upload?: File;
    returnRoute = ['/transactions'];
    tagCandidates$: Observable<Tag[]> = of([]);
    autocompleteCandidates$: Observable<Transaction[]> = of([]);

    draft = input<Transaction>();
    showHeader = input<boolean>(false);

    transactionForm = new FormGroup({
        id: new FormControl(0),
        accounts: new FormGroup(
            {
                account_id: new FormControl(''),
                destination_id: new FormControl(''),
            },
            { validators: atLeastOneAccount },
        ),
        payee: new FormControl('', {
            validators: Validators.required,
        }),
        amount: new FormControl(''),
        occurred_on: new FormControl(''),
        cleared_on: new FormControl(''),
        tags: new FormControl(''),
        note: new FormControl(''),
        receipt_url: new FormControl(''),
        existing_receipt_action: new FormControl(''),
    });
    //}, {validators: dateRange});

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private transactionService: TransactionService,
        private tagService: TagService,
    ) {}

    ngOnInit(): void {
        this.occurredOn.setValue(this.today);

        const id = Number(this.route.snapshot.paramMap.get('id') || 0);
        const account_id = Number(
            this.route.snapshot.queryParamMap.get('account_id') || 0,
        );
        const transaction_type = this.route.snapshot.queryParamMap.get('type');

        if (id > 0) {
            this.transactionService.getTransaction(id).subscribe({
                next: (transaction: Transaction) => this.populate(transaction),
                error: (error) => {
                    this.errorMessage = error.message;
                    console.error(error.message);
                },
            });
        }

        if (id === 0) {
            this.autocompletePayee();

            if (account_id > 0 && transaction_type === 'deposit') {
                this.destinationId.setValue(account_id);
            }

            if (account_id > 0 && transaction_type === 'withdrawl') {
                this.accountId.setValue(account_id);
            }

            const draft = this.draft();
            if (draft) {
                this.transactionForm.patchValue(draft.formValuesForPartial);
            }
        }

        this.tagCandidates$ = this.tags.valueChanges.pipe(
            debounceTime(300),
            switchMap((value: string) => {
                const lastTag = value.split(',').pop()?.trim() || '';
                return this.tagService.autocomplete(lastTag).pipe(
                    catchError((error: Error) => {
                        return of([]);
                    }),
                );
            }),
        );
    }

    get id() {
        return this.transactionForm.get('id') as FormControl;
    }
    get accounts() {
        return this.transactionForm.get('accounts') as FormGroup;
    }
    get accountId() {
        return this.accounts.get('account_id') as FormControl;
    }
    get destinationId() {
        return this.accounts.get('destination_id') as FormControl;
    }
    get payee() {
        return this.transactionForm.get('payee') as FormControl;
    }
    get amount() {
        return this.transactionForm.get('amount') as FormControl;
    }
    get occurredOn() {
        return this.transactionForm.get('occurred_on') as FormControl;
    }
    get clearedOn() {
        return this.transactionForm.get('cleared_on') as FormControl;
    }
    get note() {
        return this.transactionForm.get('note') as FormControl;
    }
    get tags() {
        return this.transactionForm.get('tags') as FormControl<string>;
    }
    get receipt_url() {
        return this.transactionForm.get('receipt_url') as FormControl;
    }
    get existing_receipt_action() {
        return this.transactionForm.get(
            'existing_receipt_action',
        ) as FormControl;
    }
    get today() {
        return formatDate(
            new Date(),
            'yyyy-MM-dd',
            Intl.DateTimeFormat().resolvedOptions().locale,
        );
    }
    get yesterday() {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return formatDate(
            d,
            'yyyy-MM-dd',
            Intl.DateTimeFormat().resolvedOptions().locale,
        );
    }

    clearShortcut(event: Event, field: string) {
        event.preventDefault();
        this.transactionForm.get(field)?.reset();
        this.transactionForm.markAsDirty();
    }

    todayShortcut(event: Event, field: string) {
        event.preventDefault();
        this.transactionForm.get(field)?.setValue(this.today);
        this.transactionForm.markAsDirty();
    }

    yesterdayShortcut(event: Event, field: string) {
        event.preventDefault();
        this.transactionForm.get(field)?.setValue(this.yesterday);
        this.transactionForm.markAsDirty();
    }

    populate(transaction: Transaction) {
        this.transactionForm.reset();
        this.transactionForm.patchValue(transaction.formValues);
    }

    save(): void {
        if (this.transactionForm.invalid) {
            console.log('invalid');
            return;
        }

        const t = new Transaction();
        t.id = Number(this.transactionForm.value.id);
        if (this.transactionForm.value.accounts?.account_id) {
            t.account = new Account();
            t.account.id = Number(
                this.transactionForm.value.accounts.account_id,
            );
        }

        if (this.transactionForm.value.accounts?.destination_id) {
            t.destination = new Account();
            t.destination.id = Number(
                this.transactionForm.value.accounts.destination_id,
            );
        }

        t.payee = this.transactionForm.value.payee || '';

        t.amount = Number.parseFloat(this.transactionForm.value.amount || '0');

        if (this.transactionForm.value.occurred_on) {
            t.occurred_on = new Date(this.transactionForm.value.occurred_on);
        }

        if (this.transactionForm.value.cleared_on) {
            t.cleared_on = new Date(this.transactionForm.value.cleared_on);
        }

        if (this.transactionForm.value.note) {
            t.note = this.transactionForm.value.note;
        }

        if (this.transactionForm.value.tags) {
            const tags = this.transactionForm.value.tags
                .split(',')
                .map((value) => value.toLowerCase().trim());
            for (const tag of tags) {
                const instance = new Tag();
                instance.name = tag;
                t.tags.push(instance);
            }
        }

        t.existing_receipt_action =
            this.transactionForm.value.existing_receipt_action || '';

        if (this.receipt_upload) t.receipt_upload = this.receipt_upload;

        this.transactionService.saveTransaction(t).subscribe({
            next: () => {
                if (t.isNew) {
                    this.transactionService.clearStoredFilters();
                }
                this.router.navigate(this.returnRoute);
            },
            error: (error) => {
                this.errorMessage = error.message;
                console.error(error.message);
            },
        });
    }

    canShowReceipt(): boolean {
        if (!this.receipt_url?.value) return false;
        if (this.existing_receipt_action?.value === 'discard') return false;
        return true;
    }

    canDelete(): boolean {
        return this.id.value > 0;
    }

    delete(confirmed: boolean) {
        if (!confirmed) return;
        this.transactionService.deleteTransaction(this.id.value).subscribe({
            next: () => this.router.navigate(this.returnRoute),
            error: (error) => {
                this.errorMessage = error.message;
                console.error(error.message);
            },
        });
    }

    onFileChange(event: Event) {
        const files = (event.target as HTMLInputElement).files;
        if (files) this.receipt_upload = files[0];
        this.transactionForm.markAsDirty();
    }

    discardReceipt(event: Event) {
        event.preventDefault();
        this.transactionForm
            .get('existing_receipt_action')
            ?.setValue('discard');
        this.transactionForm.markAsDirty();
    }

    appendTag(event: Event, value: string) {
        event.preventDefault();
        const tags = this.tags.value.split(',');
        tags.pop();
        tags.push(value);
        this.tags.setValue(tags.join(', '));
        this.transactionForm.markAsDirty();
        this.tagsRef().nativeElement.focus();
    }

    autocomplete(event: Event, transaction: Transaction) {
        event.preventDefault();
        this.transactionForm.patchValue(transaction.formValuesForAutocomplete);
        this.autocompletePayee();
    }

    autocompletePayee() {
        this.autocompleteCandidates$ = this.payee.valueChanges.pipe(
            debounceTime(300),
            switchMap((value) => {
                return this.transactionService
                    .getTransactions(0, 0, '', `payee:${value}`, 3)
                    .pipe(
                        catchError((error: Error) => {
                            return of([]);
                        }),
                        map((data) => (data.length > 0 ? data[0] : [])),
                    );
            }),
        );
    }

    hideAutocompleteCandidates(event: Event) {
        event.preventDefault();
        this.autocompletePayee();
    }
}
