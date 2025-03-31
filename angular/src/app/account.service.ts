import { Observable, map, throwError, catchError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
      }),
      catchError(this.handleError)
    );
  }

  getAccount(id: number): Observable<Account> {
    return this.http.get<ApiResponse<AccountRecord>>(`/api/accounts/${id}`).pipe(
      map((response) => {
        return Account.fromRecord(response.data);
      }),
      catchError(this.handleError)
    );
  }

  saveAccount(account: Account): Observable<void> {
    let request = this.http.put<void>(`/api/accounts/${account.id}`, account.formData);
    if (account.id === 0) {
      request = this.http.post<void>('/api/accounts', account.formData);
    }

    return request;
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`/api/accounts/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  handleError(error: HttpErrorResponse) {
    console.error('handleError', error);
    let message = '';
    if (error.error instanceof ErrorEvent) {
      message = error.error.message;
    } else {
      message = error.message;
    }
    console.error(message);
    return throwError(() => new Error('Something went wrong.'));
  }
}
