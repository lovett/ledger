import { HttpErrorResponse } from '@angular/common/http';
import { Transaction } from './transaction';

export type ErrorTuple = [HttpErrorResponse, string?];

export type ApiResponse<T> = {
    data: T;
    count: number;
};

export type TransactionQueryParams = {
    account_id?: number | null;
    tag?: string | null;
    query?: string | null;
    offset?: number | null;
};

export type TransactionFilter = {
    offset: number;
    tag: string;
    search: string;
    limit: number;
    account: AccountRecord;
};

export type TagRecord = {
    id: number;
    name: string;
    transaction_count: number;
    last_used?: string;
};

export type DraftRecord = {
    id: number,
    source: string,
    initial_content: string,
    transformed_content: TransactionRecord;
    transformation_type: string,
    transformation_count: number,
    percent_complete: number,
    content_id: string;
    inserted_at: string;
    updated_at: string;
};

export type AccountRecord = {
    id: number;
    name: string;
    opened_on: string;
    closed_on?: string;
    url?: string;
    note?: string;
    balance: number;
    balance_pending: number;
    balance_future: number;
    balance_final: number;
    total_pending: number;
    last_active?: string;
    logo_mime?: string;
    logo_hash?: string;
    deposit_count: number;
    withdrawl_count: number;
    account_number?: string;
    routing_number?: string;
};

export type TransactionRecord = {
    id: number;
    occurred_on: string;
    cleared_on?: string;
    amount: number;
    payee?: string;
    note?: string;
    receipt_mime?: string;
    account: Partial<AccountRecord>;
    destination: Partial<AccountRecord>;
    tags: TagRecord[];
};

export type TransactionList = [Transaction[], number, number, TransactionFilter?];


export type TransactionListResponse = ApiResponse<TransactionRecord[]> & {
    filter?: TransactionFilter;
    count_future: number;
};
