import { TagRecord } from './app.types';

export class Tag {
    id = 0;
    name = '';
    transaction_count = 0;
    last_used?: Date;

    static fromRecord(record: TagRecord): Tag {
        const tg = new Tag();
        tg.id = record.id;
        tg.name = record.name;
        tg.transaction_count = record.transaction_count;

        if (record.last_used) {
            tg.last_used = new Date(`${record.last_used}T00:00:00.0000`);
        }

        return tg;
    }

    get formData(): FormData {
        const formData = new FormData();
        formData.set('id', this.id.toString() || '0');

        formData.set('tag[name]', this.name);
        return formData;
    }
}
