import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, Subject, map, throwError } from 'rxjs';
import { Transaction } from './transaction';
import { TransactionListResponse, TransactionList, TransactionRecord, ApiResponse, TransactionFilter } from './app.types';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  selectionSubject = new Subject<Transaction[]>();
  selection$ = this.selectionSubject.asObservable();
  selections: Transaction[] = [];

  constructor(
    private http: HttpClient
  ) {}

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

    return this.http.get<TransactionListResponse>('/api/transactions', {params, }).pipe(
      map((response): TransactionList => {
        const transactions = response.data.map(record => Transaction.fromRecord(record));
        const count = response.count;
        return [transactions, count, response.filter]
      })
    );
  }

  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<ApiResponse<TransactionRecord>>(`/api/transactions/${id}`).pipe(
      map((response) => {
        return Transaction.fromRecord(response.data);
      })
    );
  }

  saveTransaction(transaction: Transaction): Observable<void> {
    let request = this.http.put<void>(`/api/transactions/${transaction.id}`, transaction.formData);
    if (transaction.id === 0) {
      request = this.http.post<void>('/api/transactions', transaction.formData);
    }

    return request;
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`/api/transactions/${id}`);
  }

  autocompletePayee(payee: string): Observable<String[]> {
    return this.http.get<String[]>('/ledger/autocomplete/payee', {params: {query: payee}}).pipe(
      map((response): String[] => {
        return response;
      })
    );
  }
}
