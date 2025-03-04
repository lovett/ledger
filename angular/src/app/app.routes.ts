import { AccountListComponent } from './account-list/account-list.component';
import { AccountFormComponent } from './account-form/account-form.component';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';

import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'accounts', component: AccountListComponent },
  { path: 'accounts/:id/edit', component: AccountFormComponent },
  { path: 'accounts/new', component: AccountFormComponent },
  { path: 'transactions', component: TransactionListComponent },
  { path: 'transactions/:id/edit', component: TransactionFormComponent },
  { path: 'transactions/new', component: TransactionFormComponent },
  { path: '', redirectTo: 'accounts', pathMatch: 'full' },
];
