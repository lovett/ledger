import { Component, inject, input } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AccountService } from '../account.service';
import { Account } from '../account';
import { LabelComponent } from '../label/label.component';

function numeric(value: number | string | undefined): number {
    if (typeof value === 'string') return Number(value);
    if (value) return value;
    return 0;
}

@Component({
    selector: 'app-account-menu',
    imports: [ReactiveFormsModule, AsyncPipe, LabelComponent],
    templateUrl: './account-menu.component.html',
    styleUrl: './account-menu.component.css',
})
export class AccountMenuComponent {
    private accountService = inject(AccountService);
    control = input<FormControl>();
    label = input<string>();
    selectedId = input(0, { transform: numeric });
    block = input(0, { transform: numeric });
    error = input<string>();
    accounts$: Observable<Account[]>;

    constructor() {
        this.accounts$ = this.accountService.getAccounts();
    }

    compare(a1: Account, a2: Account): boolean {
        if (a1 && a2) {
            return a1.id === a2.id;
        }
        return false;
    }

    get fieldName(): string {
        const control = this.control() || null;
        const parent = control?.parent;

        for (const [k, v] of Object.entries(parent?.controls || [])) {
            if (v === control) {
                return k;
            }
        }
        return '';
    }

    isDisabled(account: Account): boolean {
        if (account.id === this.block()) return true;
        if (account.closed_on) return true;
        return false;
    }

    disabledReason(account: Account): string {
        if (account.id === this.block()) return '(Already selected)';
        if (account.closed_on) return '(Closed)';
        return '';
    }
}
