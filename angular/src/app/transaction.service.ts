import { Observable, map, throwError, catchError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Transaction } from './transaction';
import { TransactionRecord, ApiResponse } from './app.types';

type TransactionList = [Transaction[], number, string];
type ListResponse = ApiResponse<TransactionRecord[]>;


@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private http: HttpClient) {
  }

  getTransactions(offset = 0, account = 0, query = ''): Observable<TransactionList> {
    let params = new HttpParams();

    if (query) {
      params = params.set("query", query);
    }

    if (account > 0) {
      params = params.set("account", account);
    }

    if (offset > 0) {
      params = params.set("offset", offset);
    }

    return this.http.get<ListResponse>('/api/transactions', {params, }).pipe(
      map((response): TransactionList => {
        const transactions = response.data.map(record => Transaction.fromRecord(record));
        const count = response.count;
        const title = response.title;
        return [transactions, count, title]
      }),
      catchError(this.handleError)
    );
  }

  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<ApiResponse<TransactionRecord>>(`/api/transactions/${id}`).pipe(
      map((response) => {
        return Transaction.fromRecord(response.data);
      }),
      catchError(this.handleError)
    );
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`/api/transactions/${id}`).pipe(
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
