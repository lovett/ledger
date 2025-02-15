import { Observable, map } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Account } from './account';
import { AccountRecord, ApiResponse } from './app.types';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient) {
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<ApiResponse<AccountRecord[]>>('/api/accounts').pipe(
      map((response) => {
        return response.data.map(record => Account.fromRecord(record));
      })
    );
  }

  getAccount(id: number): Observable<Account> {
    return this.http.get<ApiResponse<AccountRecord>>(`/api/accounts/${id}`).pipe(
      map((response) => {
        return Account.fromRecord(response.data);
      })
    );
  }

  saveAccount(account: Account): Observable<void> {
    const formData = account.asFormData();
    if (account.id === 0) {
      return this.http.post<void>('/api/accounts', formData);
    }
    return this.http.put<void>(`/api/accounts/${account.id}`, formData);
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`/api/accounts/${id}`);
  }
}
