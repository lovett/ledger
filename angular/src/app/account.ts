import {AccountRecord} from './app.types';

export class Account {
    id: number = 0;
    name: string = '';
    opened_on: Date = new Date();
    closed_on?: Date;
    url?: string;
    note?: string;
    balance: number = 0;
    total_pending: number = 0;
    last_active?: Date;
    logo_mime?: string;
    logo?: File;

    constructor() {
    }

    static fromRecord(record: AccountRecord): Account {
      const a = new Account();
      a.id = record.id;
      a.name = record.name;
      a.balance = record.balance;
      a.total_pending = record.total_pending;

      if (record.opened_on) {
        a.opened_on = new Date(`${record.opened_on}T00:00:00.0000`);
      }

      if (record.closed_on) {
        a.closed_on = new Date(`${record.closed_on}T00:00:00.0000`);
      }

      if (record.last_active) {
        a.last_active = new Date(`${record.last_active}T00:00:00.0000`);
      }

      if (record.url) {
        a.url = record.url;
      }

      if (record.note) {
        a.note = record.note;
      }

      if (record.logo_mime) {
        a.logo_mime = record.logo_mime;
      }

      return a;
    }

    // MIGRATION_PENDING
    // static clone(account: Account): Account {
    //     const a = new Account();
    //     a.id = account.id;
    //     a.name = account.name;
    //     a.opened_on = account.opened_on;
    //     a.closed_on = account.closed_on;
    //     a.url = account.url;
    //     a.note = account.note;
    //     a.balance = account.balance;
    //     a.total_pending = account.total_pending;
    //     a.last_active = account.last_active;
    //     a.logo = account.logo;
    //     return a;
    // }

    asFormData(): FormData {
        const formData = new FormData();
        formData.set('name', this.name);
        formData.set('opened_on', this.opened_on.toString());

        if (this.closed_on) {
            formData.set('closed_on', this.closed_on.toString());
        }

        if (this.url) {
            formData.set('url', this.url);
        }

        if (this.note) {
            formData.set('note', this.note);
        }

        if (this.logo) {
            formData.set('logo', this.logo);
        }

        return formData;

    }


    // MIGRATION_PENDING
    // openedOnYMD(): string {
    //     return this.dateValue(this.opened_on);
    // }

    // closedOnYMD(): string {
    //     return this.dateValue(this.closed_on);
    // }

    // dateValue(d?: Date): string {
    //     if (d) {
    //         return d.toISOString().split('T')[0];
    //     }

    //     return '';
    // }
}
