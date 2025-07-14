import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe, AsyncPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Account } from '../account';
import { AccountService } from '../account.service';
import { ButtonComponent } from '../button/button.component';
import { Observable, of, tap } from 'rxjs';

@Component({
    selector: 'app-account-list',
    imports: [
        CurrencyPipe,
        DatePipe,
        RouterLink,
        AsyncPipe,
        ButtonComponent,
        CommonModule,
    ],
    templateUrl: './account-list.component.html',
    styleUrl: './account-list.component.css',
})
export class AccountListComponent {
    accounts$: Observable<Account[]> = of([]);
    loading = false;

    constructor(private accountService: AccountService) {}

    ngOnInit() {
        this.loading = true;
        this.accounts$ = this.accountService
            .getAccounts()
            .pipe(tap(() => (this.loading = false)));
    }
}
