import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
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
  filterSessionKey = 'transaction:filters';

  constructor(
    private http: HttpClient
  ) {}

  storeFilters(filters: string) {
    window.sessionStorage.setItem(this.filterSessionKey, filters);
  }

  recallStoredFilters(): Params {
    const storedValue = window.sessionStorage.getItem(this.filterSessionKey) || '';

    const searchParams = new URLSearchParams(storedValue)
    const params: Params = {};
    searchParams.forEach((v, k) => params[k] = v);
    return params;
  }

  clearStoredFilters() {
    window.sessionStorage.removeItem(this.filterSessionKey);
  }

  getTransactions(offset = 0, account_id = 0, tag = '', query = '', limit = 0): Observable<TransactionList> {
    let params = new HttpParams();

    if (offset > 0) {
      params = params.set("offset", offset);
    }

    if (limit > 0) {
      params = params.set("limit", limit);
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
