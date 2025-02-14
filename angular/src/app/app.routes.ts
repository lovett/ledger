import { AccountListComponent } from './account-list/account-list.component';

import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'accounts', component: AccountListComponent },
  { path: '', redirectTo: 'accounts', pathMatch: 'full' },
];
