export type ApiResponse<T> = {
  data: T;
}

export type AccountRecord = {
    id: number,
    name: string,
    opened_on: string,
    closed_on?: string,
    url?: string,
    note?: string,
    balance: number,
    total_pending: number,
    last_active?: string,
    logo_mime?: string,
}
