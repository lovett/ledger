import { Observable, map, throwError, catchError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Transaction } from './transaction';
import { TransactionRecord, ApiResponse } from './app.types';
import { ReplaySubject } from 'rxjs';

type TransactionList = [Transaction[], number];
type ListResponse = ApiResponse<TransactionRecord[]>;

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  selectionSubject = new ReplaySubject<Transaction[]>();
  selection$ = this.selectionSubject.asObservable();
  selections: Transaction[] = [];

  constructor(
    private http: HttpClient
  ) {}

  //clearSelection() {
    // this.selectedTransactions.forEach(t => t.selected = false);
    // this.selectedTransactions = [];
    // this.selectionSubject.next(0);
  //}

  // transactionSelection(t: Transaction) {
  //   const amount = t.selected ? t.amount : t.amount * -1;
  //   this.selectionSubject.next(amount);
  // }

  getTransactions(offset = 0, account_id = 0, tag = '', query = ''): Observable<TransactionList> {
    let params = new HttpParams();

    if (offset > 0) {
      params = params.set("offset", offset);
    }

    if (account_id > 0) {
      params = params.set("account_id", account_id);
    }

    if (tag) {
      params = params.set("tag", tag);
    }

    if (query) {
      params = params.set("query", query);
    }
    return this.http.get<ListResponse>('/api/transactions', {params, }).pipe(
      map((response): TransactionList => {
        const transactions = response.data.map(record => Transaction.fromRecord(record));
        const count = response.count;
        return [transactions, count]
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

  saveTransaction(transaction: Transaction): Observable<void> {
    let request = this.http.put<void>(`/api/transactions/${transaction.id}`, transaction.formData);
    if (transaction.id === 0) {
      request = this.http.post<void>('/api/transactions', transaction.formData);
    }

    return request.pipe(
      catchError(this.handleError)
    );
  }

  // clearTransaction(id: number): Observable<void> {
  //   return this.http.patch<void>(`/api/transactions/${id}`, transaction
  // }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`/api/transactions/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  autocompletePayee(payee: string): Observable<String[]> {
    return this.http.get<String[]>('/ledger/autocomplete/payee', {params: {query: payee}}).pipe(
      map((response): String[] => {
        return response;
      }),
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
