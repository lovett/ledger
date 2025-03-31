import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators, AsyncValidatorFn } from '@angular/forms';
import { accountDatesValidator } from './account-dates.directive';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Account } from '../account';
import { AccountService } from '../account.service';
import { ButtonComponent } from '../button/button.component';
import { LabelComponent } from '../label/label.component';
import { Observable, map, of } from 'rxjs';
import { ErrorService } from '../error.service';


@Component({
  selector: 'app-account-form',
  imports: [ReactiveFormsModule, ButtonComponent, LabelComponent, RouterLink],
  templateUrl: './account-form.component.html',
  styleUrl: './account-form.component.css'
})
export class AccountFormComponent implements OnInit {
  logo_upload?: File;
  account?: Account;
  deletionConfirmationMessage?: string;
  errorMessage?: string;
  returnRoute = ['/accounts'];

  accountForm = new FormGroup({
    id: new FormControl(0),
    name: new FormControl('', {
      validators: Validators.required,
    }),
    url: new FormControl(''),
    opened_on: new FormControl(''),
    closed_on: new FormControl(''),
    note: new FormControl(''),
    logo_url: new FormControl(''),
    existing_logo_action: new FormControl(''),
  }, { validators: accountDatesValidator });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private errorService: ErrorService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') || 0)
    if (id === 0) return;

    this.accountService.getAccount(id).subscribe({
      next: (account: Account) => this.populate(account),
      error: (error) => {
        this.errorMessage = error.message;
        console.error(error.message);
      }
    });
  }

  get id() { return this.accountForm.get('id') as FormControl }
  get name() { return this.accountForm.get('name') as FormControl }
  get openedOn() { return this.accountForm.get('opened_on') as FormControl }
  get closedOn() { return this.accountForm.get('closed_on') as FormControl }
  get note() { return this.accountForm.get('note') as FormControl }
  get url() { return this.accountForm.get('url') as FormControl }
  get logo_url() { return this.accountForm.get('logo_url') as FormControl }
  get existing_logo_action() { return this.accountForm.get('existing_logo_action') as FormControl }

  delete(confirmed: boolean) {
    if (!confirmed) return;
    this.accountService.deleteAccount(this.id.value).subscribe({
      next: () => this.router.navigate(this.returnRoute),
      error: (error) => {
        this.errorMessage = error.message;
        console.error(error.message);
      }
    });
  }

  save(): void {
    if (this.accountForm.invalid) {
      console.log('invalid');
      return;
    }

    const a = new Account();
    a.id = Number(this.accountForm.value.id);
    a.name = this.accountForm.value.name!;
    if (this.accountForm.value.opened_on) {
      a.opened_on = new Date(this.accountForm.value.opened_on);
    }

    if (this.accountForm.value.closed_on) {
      a.closed_on = new Date(this.accountForm.value.closed_on);
    }

    a.url = this.accountForm.value.url!;
    a.note = this.accountForm.value.note!;
    a.existing_logo_action = this.accountForm.value.existing_logo_action!;

    if (this.logo_upload) a.logo_upload = this.logo_upload;

    this.accountService.saveAccount(a).subscribe({
      next: () => this.router.navigate(this.returnRoute),
      error: (error: HttpErrorResponse) => {
        if (error.error.errors.name) {
          this.name.setErrors({unique: true});
        }
        this.errorService.reportError(error, 'The account was not saved.');
      }
    });
  }

  clear(event: Event, field: string) {
    event.preventDefault();
    this.accountForm.get(field)?.reset();
    this.accountForm.markAsDirty();
  }

  discardLogo(event: Event) {
    event.preventDefault();
    this.accountForm.get('existing_logo_action')?.setValue('discard');
    this.accountForm.markAsDirty();
  }

  canShowLogo(): boolean {
    if (!this.logo_url?.value) return false;
    if (this.existing_logo_action?.value === 'discard') return false;
    return true;
  }

  canDelete(): boolean {
    return this.id.value > 0;
  }

  populate(account: Account) {
    this.accountForm.reset();
    this.accountForm.patchValue(account.formValues);

    console.log('count', account.transactionCount);

    if (account.transactionCount === 0) {
      this.deletionConfirmationMessage = 'Delete this account? No transactions will be affected.';
    }

    if (account.transactionCount === 1) {
      this.deletionConfirmationMessage = 'Delete this account and 1 transaction associated with it?';
    }

    if (account.transactionCount > 1) {
      this.deletionConfirmationMessage = `Delete this account and ${account.transactionCount} transactions associated with it?`;
    }
  }

  onFileChange(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) this.logo_upload = files[0];
    this.accountForm.markAsDirty();
  }
}
