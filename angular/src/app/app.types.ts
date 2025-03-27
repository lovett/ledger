import { HttpErrorResponse } from '@angular/common/http';
import { Transaction } from './transaction';

export type ErrorTuple = [HttpErrorResponse, string?];

export type ApiResponse<T> = {
  data: T;
  count: number
}

export type TransactionQueryParams = {
  account_id?: number | null,
  tag?: string | null,
  query?: string | null,
  offset?: number | null,
}

export type TransactionFilter = {
  offset: number,
  tag: string,
  search: string,
  limit: number,
  account: AccountRecord
}

export type TagRecord = {
  id: number,
  name: string,
  transaction_count: number,
  last_used?: string,
}

export type AccountRecord = {
  id: number,
  name: string,
  opened_on: string,
  closed_on?: string,
  url?: string,
  note?: string,
  balance: number,
  balance_pending: number,
  total_pending: number,
  last_active?: string,
  logo_mime?: string,
  deposit_count: number,
  withdrawl_count: number,
}

export type TransactionRecord = {
  id: number,
  occurred_on: string,
  cleared_on?: string,
  amount: number,
  payee?: string,
  note?: string,
  receipt_mime?: string,
  account: Partial<AccountRecord>,
  destination: Partial<AccountRecord>,
  tags: TagRecord[],
}

export type TransactionList = [Transaction[], number, TransactionFilter?];

export type TransactionListResponse = ApiResponse<TransactionRecord[]> & {filter?: TransactionFilter }
