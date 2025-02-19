import { AccountListComponent } from './account-list/account-list.component';
import { AccountFormComponent } from './account-form/account-form.component';

import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'accounts', component: AccountListComponent },
  { path: 'accounts/:id/edit', component: AccountFormComponent },
  { path: 'accounts/new', component: AccountFormComponent },
  { path: '', redirectTo: 'accounts', pathMatch: 'full' },
];
