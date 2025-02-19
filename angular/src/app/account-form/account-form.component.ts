import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators, AsyncValidatorFn } from '@angular/forms';
import { accountDatesValidator } from './account-dates.directive';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Account } from '../account';
import { AccountService } from '../account.service';
import { ButtonComponent } from '../button/button.component';

import { Observable, map, of } from 'rxjs';


// MIGRATION_PENDING
// function uniqueName(id: number, accountService: AccountService): AsyncValidatorFn {
//   const sanitizer = (value: string) => value.toLowerCase().replace(/\s+/g, '');
//   return (control: AbstractControl): Observable<ValidationErrors | null> => {
//     if (id !== 0) {
//       return of(null);
//     }

//     const needle = sanitizer(control.value);
//     return accountService.getAccounts().pipe(
//       map(accounts => {
//         for (const account of accounts) {
//           if (sanitizer(account.name) === needle) {
//             return {'unique': true}
//           }
//         }
//         return null;
//       })
//     );
//   }
// }

@Component({
  selector: 'app-account-form',
  imports: [ReactiveFormsModule, ButtonComponent, RouterLink],
  templateUrl: './account-form.component.html',
  styleUrl: './account-form.component.css'
})
export class AccountFormComponent implements OnInit {
  logo_upload?: File;
  account?: Account;
  errorMessage?: string;
  returnRoute = ['/accounts'];

  accountForm = new FormGroup({
    id: new FormControl(0),
    name: new FormControl('', {
      validators: Validators.required,
      // MIGRATION_PENDING asyncValidators: uniqueName(id, this.accountService),
      updateOn: 'blur',
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
  ) {
  }

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

  get name() { return this.accountForm.get('name') }
  get openedOn() { return this.accountForm.get('opened_on') }
  get closedOn() { return this.accountForm.get('closed_on') }
  get note() { return this.accountForm.get('note') }
  get url() { return this.accountForm.get('url') }
  get logo_url() { return this.accountForm.get('logo_url') }
  get existing_logo_action() { return this.accountForm.get('existing_logo_action') }

  delete() {
    this.accountService.deleteAccount(this.accountForm.value.id!).subscribe({
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
      error: (error) => {
        this.errorMessage = error.message;
        console.error(error.message);
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
    return this.accountForm.get('id')?.value! > 0;
  }

  populate(account: Account) {
    this.accountForm.reset();
    this.accountForm.patchValue(account.formValues);
  }

  onFileChange(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) this.logo_upload = files[0];
    this.accountForm.markAsDirty();
  }
}
