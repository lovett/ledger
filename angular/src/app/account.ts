import { AccountRecord } from './app.types';

export class Account {
    id = 0;
    name = '';
    opened_on?: Date;
    closed_on?: Date;
    url = '';
    note = '';
    balance = 0;
    balance_pending = 0;
    balance_future = 0;
    balance_final = 0;
    total_pending = 0;
    last_active?: Date;
    logo_mime = '';
    logo_hash = '';
    logo_upload?: File;
    existing_logo_action = 'keep';
    withdrawl_count = 0;
    deposit_count = 0;
    account_number = '';
    routing_number = '';

    static fromRecord(record: AccountRecord | Partial<AccountRecord>): Account {
        const a = new Account();
        a.id = record.id ?? 0;
        a.name = record.name ?? '';
        a.balance = (record.balance ?? 0) / 100;
        a.balance_pending = (record.balance_pending ?? 0) / 100;
        a.balance_future = (record.balance_future ?? 0) / 100;
        a.balance_final = (record.balance_final ?? 0) / 100;
        a.total_pending = record.total_pending ?? 0;
        a.account_number = record.account_number ?? '';
        a.routing_number = record.routing_number ?? '';

        if (record.deposit_count) {
            a.deposit_count = record.deposit_count;
        }

        if (record.withdrawl_count) {
            a.withdrawl_count = record.withdrawl_count;
        }

        if (record.opened_on) {
            a.opened_on = new Date(`${record.opened_on}T00:00:00.0000`);
        }

        if (record.closed_on) {
            a.closed_on = new Date(`${record.closed_on}T00:00:00.0000`);
        }

        if (record.last_active) {
            a.last_active = new Date(`${record.last_active}T00:00:00.0000`);
        }

        a.url = record.url ?? '';
        a.note = record.note ?? '';
        a.logo_mime = record.logo_mime ?? '';
        a.logo_hash = record.logo_hash ?? '';

        return a;
    }

    ymd(d?: Date) {
        if (!d) return '';
        return d.toISOString().substring(0, 10);
    }

    get transactionCount() {
        return this.deposit_count + this.withdrawl_count;
    }

    get formValues(): object {
        return {
            id: this.id.toString(),
            name: this.name,
            url: this.url,
            opened_on: this.ymd(this.opened_on),
            closed_on: this.ymd(this.closed_on),
            account_number: this.account_number,
            routing_number: this.routing_number,
            note: this.note,
            logo_url: this.logo_mime ? this.logoUrl : '',
        };
    }

    get logoUrl(): string {
        if (!this.logo_mime) return '';
        const path = `/api/accounts/${this.id}/logo`;
        if (this.logo_hash) {
            return `${path}/${this.logo_hash}`;
        }
        return path;
    }

    get formData(): FormData {
        const formData = new FormData();
        formData.set('id', this.id.toString() || '0');

        formData.set('account[name]', this.name);
        formData.set('account[url]', this.url);
        formData.set('account[note]', this.note);
        formData.set('account[account_number]', this.account_number);
        formData.set('account[routing_number]', this.routing_number);

        if (this.opened_on) {
            formData.set('account[opened_on]', this.ymd(this.opened_on));
        }

        if (this.closed_on) {
            formData.set('account[closed_on]', this.ymd(this.closed_on));
        }

        if (this.logo_upload) {
            formData.set('account[logo_upload]', this.logo_upload);
        }

        formData.set(
            'account[existing_logo_action]',
            this.existing_logo_action,
        );
        return formData;
    }
}
