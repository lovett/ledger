import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Account } from '../account';
import { AccountService } from '../account.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-account-list',
  imports: [CurrencyPipe, DatePipe, RouterLink, AsyncPipe, ButtonComponent],
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.css'
})
export class AccountListComponent {
  accounts$: Observable<Account[]>;

  constructor(
    private accountService: AccountService

  ) {
    this.accounts$ = this.accountService.getAccounts();
  }
}
