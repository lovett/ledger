import { Account } from './account';
import {TransactionRecord} from './app.types';

export class Transaction {
  id: number = 0;
  occurred_on?: Date = new Date();
  cleared_on?: Date;
  amount: number = 0;
  payee?: string;
  note?: string;
  receipt_mime?: string;
  account?: Partial<Account>;
  destination?: Partial<Account>;
  selected = false;

  constructor() {
  }

  static fromRecord(record: TransactionRecord): Transaction {
    const t = new Transaction();
    t.id = record.id;
    t.amount = record.amount / 100;
    t.payee = record.payee ?? '';
    t.note = record.note ?? '';
    t.receipt_mime = record.receipt_mime ?? ''

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

    return t;
  }

  get transactionType(): string {
    if (this.account && this.destination) return 'transfer';
    if (this.account && !this.destination) return 'withdrawl';
    return 'deposit';
  }

  get isTransfer(): boolean {
    return Boolean(this.account) && Boolean(this.destination);
  }

  get rowClasses(): Record<string, any> {
    return {
      cleared: this.cleared_on,
      selected: this.selected
    }
  }
}
