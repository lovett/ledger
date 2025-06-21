import { Account } from './account';
import { Tag } from './tag';
import { TransactionRecord } from './app.types';

export class Transaction {
    id = 0;
    occurred_on?: Date = new Date();
    cleared_on?: Date;
    amount = 0;
    payee = '';
    note?: string;
    account?: Partial<Account>;
    destination?: Partial<Account>;
    receipt_mime = '';
    receipt_upload?: File;
    existing_receipt_action = 'keep';
    tags: Tag[] = [];
    selected = false;

    ymd(d?: Date) {
        if (!d) return '';
        return d.toISOString().substring(0, 10);
    }

    static fromRecord(record: TransactionRecord): Transaction {
        const t = new Transaction();
        t.id = record.id;
        t.amount = record.amount / 100;
        t.payee = record.payee ?? '';
        t.note = record.note ?? '';
        t.receipt_mime = record.receipt_mime ?? '';

        if (record.occurred_on) {
            t.occurred_on = new Date(`${record.occurred_on}T00:00:00.0000`);
        }

        if (record.cleared_on) {
            t.cleared_on = new Date(`${record.cleared_on}T00:00:00.0000`);
        }

        if (record.account) {
            t.account = Account.fromRecord(record.account);
        }

        if (record.destination) {
            t.destination = Account.fromRecord(record.destination);
        }

        for (const item of record.tags) {
            t.tags.push(Tag.fromRecord(item));
        }

        return t;
    }

    get formValues(): object {
        return {
            id: this.id.toString(),
            payee: this.payee,
            amount: this.amount.toFixed(2),
            accounts: {
                account_id: this.account?.id,
                destination_id: this.destination?.id,
            },
            occurred_on: this.ymd(this.occurred_on),
            cleared_on: this.ymd(this.cleared_on),
            note: this.note,
            receipt_url: this.receipt_mime ? this.receiptUrl : '',
            tags: this.delimitedTags,
        };
    }

    get formValuesForAutocomplete(): object {
        return {
            payee: this.payee,
            amount: this.amount.toFixed(2),
            accounts: {
                account_id: this.account?.id,
                destination_id: this.destination?.id,
            },
            note: this.note,
            tags: this.delimitedTags,
        };
    }

    get delimitedTags(): string {
        let result = '';
        for (const tag of this.tags) {
            result += `${tag.name}, `;
        }
        return result.slice(0, -2);
    }

    get transactionType(): string {
        if (this.account && this.destination) return 'transfer';
        if (this.account && !this.destination) return 'withdrawl';
        return 'deposit';
    }

    get isTransfer(): boolean {
        return Boolean(this.account) && Boolean(this.destination);
    }

    get isNew(): boolean {
        return this.id === 0;
    }

    get rowClasses(): Record<string, boolean> {
        return {
            cleared: !!this.cleared_on,
            pending: !this.cleared_on,
            selected: this.selected,
        };
    }

    get receiptUrl(): string {
        if (!this.receipt_mime) return '';
        return `/api/transactions/${this.id}/receipt`;
    }

    get formData(): FormData {
        const formData = new FormData();
        formData.set('id', this.id.toString());
        formData.set('transaction[payee]', this.payee);
        formData.set(
            'transaction[amount]',
            Math.ceil(this.amount * 100).toString(),
        );
        formData.set('transaction[occurred_on]', this.ymd(this.occurred_on));

        if (this.cleared_on) {
            formData.set('transaction[cleared_on]', this.ymd(this.cleared_on));
        }

        if (this.account?.id) {
            formData.set('transaction[account_id]', this.account.id.toString());
        }

        if (this.destination?.id) {
            formData.set(
                'transaction[destination_id]',
                this.destination.id.toString(),
            );
        }

        if (this.note) {
            formData.set('transaction[note]', this.note);
        }

        if (this.receipt_upload) {
            formData.set('transaction[receipt_upload]', this.receipt_upload);
        }

        formData.set(
            'transaction[existing_receipt_action]',
            this.existing_receipt_action,
        );
        formData.set('transaction[tags]', this.delimitedTags);
        return formData;
    }
}
