import {AccountRecord} from './app.types';

export class Account {
  id: number = 0;
  name: string = '';
  opened_on?: Date;
  closed_on?: Date;
  url: string = '';
  note: string = '';
  balance: number = 0;
  total_pending: number = 0;
  last_active?: Date;
  logo_mime: string = '';
  logo_upload?: File;
  existing_logo_action: string = 'keep';

  constructor() {
  }

  static fromRecord(record: AccountRecord | Partial<AccountRecord>): Account {
    const a = new Account();
    a.id = record.id ?? 0;
    a.name = record.name ?? '';
    a.balance = (record.balance ?? 0) / 100;

    a.total_pending = record.total_pending ?? 0;

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

    return a;
  }

  ymd(d?: Date) {
    if (!d) return '';
    return d.toISOString().substring(0, 10);
  }

  get formValues(): object {
    return {
      id: this.id.toString(),
      name: this.name,
      url: this.url,
      opened_on: this.ymd(this.opened_on),
      closed_on: this.ymd(this.closed_on),
      note: this.note,
      logo_url: this.logo_mime ? this.logoUrl : '',
    }
  }

  get logoUrl(): string {
    if (!this.logo_mime) return '';
    return `/api/accounts/${this.id}/logo`;
  }

  get formData(): FormData {
    const formData = new FormData();
    formData.set('id', this.id.toString() || "0");

    formData.set('account[name]', this.name);
    if (this.opened_on) {
      formData.set('account[opened_on]', this.ymd(this.opened_on));
    }

    if (this.closed_on) {
      formData.set('account[closed_on]', this.ymd(this.closed_on));
    }

    if (this.url) {
      formData.set('account[url]', this.url);
    }

    if (this.note) {
      formData.set('account[note]', this.note);
    }

    if (this.logo_upload) {
      formData.set('account[logo_upload]', this.logo_upload);
    }

    formData.set('account[existing_logo_action]', this.existing_logo_action);
    return formData;
  }
}
