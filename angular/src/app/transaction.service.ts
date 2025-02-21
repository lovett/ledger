import { Observable, map, throwError, catchError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Transaction } from './transaction';
import { TransactionRecord, ApiResponse } from './app.types';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private http: HttpClient) {
  }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<ApiResponse<TransactionRecord[]>>('/api/transactions').pipe(
      map((response) => {
        return response.data.map(record => Transaction.fromRecord(record));
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
