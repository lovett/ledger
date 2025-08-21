import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import {
    HttpClient,
    HttpContext,
    HttpErrorResponse,
    HttpParams,
} from '@angular/common/http';
import { Observable, Subject, map, throwError } from 'rxjs';
import { Transaction } from './transaction';
import {
    TransactionListResponse,
    TransactionList,
    TransactionRecord,
    ApiResponse,
    TransactionFilter,
} from './app.types';
import { CACHEABLE, CLEARABLES } from './caching.interceptor';

@Injectable({
    providedIn: 'root',
})
export class TransactionService {
    selectionSubject = new Subject<Transaction[]>();
    selection$ = this.selectionSubject.asObservable();
    selections: Transaction[] = [];
    filterSessionKey = 'transaction:filters';
    previousFilterSessionKey = 'transaction:filters:previous';

    constructor(private http: HttpClient) {}

    clearableContext(): HttpContext {
        return new HttpContext().set(CLEARABLES, [
            '/api/accounts',
            '/api/tags',
        ]);
    }

    storeFilters(filters: string) {
        window.sessionStorage.setItem(this.filterSessionKey, filters);
    }

    recallStoredFilters(): Params {
        const storedValue =
            window.sessionStorage.getItem(this.filterSessionKey) || '';

        const searchParams = new URLSearchParams(storedValue);
        const params: Params = {};
        searchParams.forEach((v, k) => (params[k] = v));
        return params;
    }

    canRestorePreviousFilter(): boolean {
        const value = window.sessionStorage.getItem(this.previousFilterSessionKey) || '';
        return value !== '';
    }

    restorePreviousFilter() {
        const value = window.sessionStorage.getItem(this.previousFilterSessionKey) || '';
        this.storeFilters(value);
        window.sessionStorage.removeItem(this.previousFilterSessionKey);
    }

    clearPreviousFilter() {
        window.sessionStorage.removeItem(this.previousFilterSessionKey);
    }

    clearStoredFilters() {
        const currentFilters = window.sessionStorage.getItem(this.filterSessionKey) || '';
        if (currentFilters !== '') {
            window.sessionStorage.setItem(this.previousFilterSessionKey, currentFilters);
            window.sessionStorage.removeItem(this.filterSessionKey);
        }
    }

    getTransactions(
        offset = 0,
        account_id = 0,
        tag = '',
        query = '',
        limit = 0,
        account_scope = 'all'
    ): Observable<TransactionList> {
        let params = new HttpParams();

        if (offset > 0) {
            params = params.set('offset', offset);
        }

        if (limit > 0) {
            params = params.set('limit', limit);
        }

        if (account_id > 0) {
            params = params.set('account_id', account_id);
        } else {
            params = params.set('account_scope', account_scope);
        }

        if (tag) {
            params = params.set('tag', tag);
        }

        if (query) {
            params = params.set('query', query);
        }

        return this.http
            .get<TransactionListResponse>('/api/transactions', { params })
            .pipe(
                map((response): TransactionList => {
                    const transactions = response.data.map((record) =>
                        Transaction.fromRecord(record),
                    );
                    const count = response.count;
                    const count_future = response.count_future;
                    return [transactions, count, count_future, response.filter];
                }),
            );
    }

    getTransaction(id: number): Observable<Transaction> {
        return this.http
            .get<ApiResponse<TransactionRecord>>(`/api/transactions/${id}`)
            .pipe(
                map((response) => {
                    return Transaction.fromRecord(response.data);
                }),
            );
    }

    saveTransaction(transaction: Transaction): Observable<void> {
        const context = this.clearableContext();

        let request = this.http.put<void>(
            `/api/transactions/${transaction.id}`,
            transaction.formData,
            { context },
        );
        if (transaction.id === 0) {
            request = this.http.post<void>(
                '/api/transactions',
                transaction.formData,
                { context },
            );
        }

        return request;
    }

    deleteTransaction(id: number): Observable<void> {
        return this.http.delete<void>(`/api/transactions/${id}`);
    }

    autocompletePayee(payee: string): Observable<string[]> {
        return this.http
            .get<string[]>('/ledger/autocomplete/payee', {
                params: { query: payee },
            })
            .pipe(
                map((response): string[] => {
                    return response;
                }),
            );
    }
}
