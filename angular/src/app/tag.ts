import {TagRecord} from './app.types';

export class Tag {
  id: number = 0;
  name: string = '';

  static fromRecord(record: TagRecord): Tag {
    const tg = new Tag();
    tg.id = record.id;
    tg.name = record.name;
    return tg;
  }
}
