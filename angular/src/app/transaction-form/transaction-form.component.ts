import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormGroup, FormControl, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AsyncPipe, DecimalPipe, formatDate } from '@angular/common';
import { Transaction } from '../transaction';
import { Account } from '../account';
import { Tag } from  '../tag';
//import { Tag } from '../models/tag';
import { TransactionService } from '../transaction.service';
import { switchMap, debounceTime, filter } from 'rxjs';
import { ButtonComponent } from '../button/button.component';
import { AccountMenuComponent } from '../account-menu/account-menu.component';
import { LabelComponent } from '../label/label.component';

function atLeastOneAccount(group: AbstractControl): ValidationErrors | null {
  const a1 = group.get('account_id');
  const a2 = group.get('destination_id');
  if (!a1 || !a2) return null;
  if (a1.pristine && a2.pristine) return null;
  if (a1.value || a2.value) return null;
  return { 'atLeastOneAccount': 'Specify at least one account' }
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

    return { 'daterange': true }

}

@Component({
  selector: 'app-transaction-form',
  imports: [ReactiveFormsModule, ButtonComponent, AccountMenuComponent, LabelComponent, RouterLink],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.css'
})
export class TransactionFormComponent implements OnInit {
  transaction?: Transaction;
  errorMessage?: string;
  datesExpanded = false;
  //autocompleteFrom: Transaction | null;
  receipt_upload?: File;
  returnRoute = ['/transactions'];

  transactionForm = new FormGroup({
    id: new FormControl(0),
    accounts: new FormGroup({
      account_id: new FormControl(''),
      destination_id: new FormControl(''),
    }, {validators: atLeastOneAccount}),
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

    ) {
        // this.singularResourceName = 'transaction';
        // this.autocompleteFrom = null;
        // this.receipt = null;
        // this.transaction = null;
    }

    ngOnInit(): void {
      const id = Number(this.route.snapshot.paramMap.get('id') || 0)
      if (id === 0) {
        this.occurredOn.setValue(this.today)
        return;
      }

      this.transactionService.getTransaction(id).subscribe({
        next: (transaction: Transaction) => this.populate(transaction),
        error: (error) => {
          this.errorMessage = error.message;
          console.error(error.message);
        }
      });

        // this.amount.valueChanges.subscribe({
        //     next: (value) => {
        //         if (!value) return;
        //         this.amount.setValue(value.replace(/[^0-9.]/, ''), {emitEvent: false});
        //     },
        // });

        // if (id === 0) {
        //     this.payee.valueChanges.pipe(
        //         filter(value => value && value.length > 2),
        //         debounceTime(500),
        //         switchMap(payee => this.transactionService.autocompletePayee(payee)),
        //     ).subscribe((result => this.autocomplete(result)));
        // }
    }

  get id() { return this.transactionForm.get('id') as FormControl }
  get accounts() { return this.transactionForm.get('accounts') as FormGroup }
  get accountId() { return this.accounts.get('account_id') as FormControl }
  get destinationId() { return this.accounts.get('destination_id') as FormControl }
  get payee() { return this.transactionForm.get('payee') as FormControl }
  get amount() { return this.transactionForm.get('amount') as FormControl }
  get occurredOn() { return this.transactionForm.get('occurred_on') as FormControl }
  get clearedOn() { return this.transactionForm.get('cleared_on') as FormControl }
  get note() { return this.transactionForm.get('note') as FormControl }
  get tags() { return this.transactionForm.get('tags') as FormControl }
  get receipt_url() { return this.transactionForm.get('receipt_url') as FormControl }
  get existing_receipt_action() { return this.transactionForm.get('existing_receipt_action') as FormControl}
  get today() { return formatDate(new Date(), 'yyyy-MM-dd', Intl.DateTimeFormat().resolvedOptions().locale); }


  clearShortcut(event: Event, field: string) {
    event.preventDefault();
    this.transactionForm.get(field)?.reset();
    this.transactionForm.markAsDirty();
  }


  todayShortcut(event: Event, field: string) {
    event.preventDefault();
    this.transactionForm.get(field)?.setValue(this.today);
  }

  //autocomplete(searchResult: TransactionList) {
        // if (searchResult.count === 0) {
        //     this.autocompleteFrom = null;
        //     return;
        // }

        // this.autocompleteFrom = Transaction.fromJson(searchResult.transactions[0]);
  //}

    applyAutocompletedTransaction(e: MouseEvent) {
        // e.preventDefault();
        // if (!this.autocompleteFrom) {
        //     return;
        // }

        // while (this.tags.controls.length < this.autocompleteFrom.tags.length) {
        //     this.tagFieldPush('', false);
        // }

        // this.transactionForm.patchValue({
        //     account: this.autocompleteFrom.account || null,
        //     payee: this.autocompleteFrom.payee,
        //     amount: this.moneyPipe.transform(this.autocompleteFrom.amount, 'plain'),
        //     note: this.autocompleteFrom.note,
        //     tags: this.autocompleteFrom.tags,
        // }, { emitEvent: false});

        // this.autocompleteFrom = null;
    }

    tagFieldPush(value = '', markDirty = true) {
        // this.tags.push(this.formBuilder.control(value));
        // if (markDirty) {
        //     this.transactionForm.markAsDirty();
        // }
    }

    tagFieldPop() {
        // this.tags.removeAt(-1);
        // this.transactionForm.markAsDirty();
    }

    populate(transaction: Transaction) {
      this.transactionForm.reset();
      this.transactionForm.patchValue(transaction.formValues);
    }

    changeAccount(account: Account) {
        // this.transactionForm.patchValue({
        //     account: account,
        // });
    }

  save(): void {
    if (this.transactionForm.invalid) {
      console.log('invalid');
      return;
    }

        // if (!this.transactionForm.valid) {
        //     this.errorMessage = 'Cannot save because the form is incomplete.';
        //     return;
        // }

        // if (!this.transactionForm.dirty) {
        //     this.errorMessage = 'Cannot save because nothing has changed.';
        //     return;
        // }

        // if (!this.account.value && !this.destination.value) {
        //     this.errorMessage = 'Cannot save because an account has not been specified.';
        //     return;
        // }

    const t = new Transaction();
    t.id = Number(this.transactionForm.value.id);
    if (this.transactionForm.value.accounts!.account_id) {
      t.account = new Account();
      t.account.id = Number(this.transactionForm.value.accounts!.account_id);
    }

    if (this.transactionForm.value.accounts!.destination_id) {
      t.destination = new Account();
      t.destination.id = Number(this.transactionForm.value.accounts!.destination_id);
    }

    t.payee = this.transactionForm.value.payee!;

    t.amount = parseFloat(this.transactionForm.value.amount || "0");

    if (this.transactionForm.value.occurred_on) {
      t.occurred_on = new Date(this.transactionForm.value.occurred_on);
    }

    if (this.transactionForm.value.cleared_on) {
      t.cleared_on = new Date(this.transactionForm.value.cleared_on);
    }

    if (this.transactionForm.value.note) {
      t.note = this.transactionForm.value.note;
    }

    console.log('x', this.transactionForm.value);
    if (this.transactionForm.value.tags) {
      const tags = this.transactionForm.value.tags.split(',').map(value => value.toLowerCase().trim());
      for (const tag of tags) {
        const instance = new Tag();
        instance.name = tag;
        t.tags.push(instance);
      }
    }

    if (this.receipt_upload) t.receipt_upload = this.receipt_upload;

    this.transactionService.saveTransaction(t).subscribe({
      next: () => this.router.navigate(this.returnRoute),
      error: (error) => {
        this.errorMessage = error.message;
        console.error(error.message);
      }
    });
  }

    deleted() {
        // this.transactionForm.reset();
        // this.router.navigate(['/transactions']);
    }

  canShowReceipt(): boolean {
    if (!this.receipt_url?.value) return false;
    if (this.existing_receipt_action?.value === 'discard') return false;
    return true;
  }

  canDelete(): boolean {
    return this.id.value > 0;
  }

  delete() {
    this.transactionService.deleteTransaction(this.id.value).subscribe({
      next: () => this.router.navigate(this.returnRoute),
      error: (error) => {
        this.errorMessage = error.message;
        console.error(error.message);
      }
    });
  }

  onFileChange(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) this.receipt_upload = files[0];
    this.transactionForm.markAsDirty();
  }

  discardReceipt(event: Event) {
    event.preventDefault();
    this.transactionForm.get('existing_receipt_action')?.setValue('discard');
    this.transactionForm.markAsDirty();
  }
}
