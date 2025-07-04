import { DraftRecord, TransactionRecord } from './app.types';
import { Transaction } from './transaction';


export class Draft {
    id = 0;
    source = '';
    initialContent = '';
    transformedContent?: Transaction;
    transformationType = '';
    transformationCount = 0;
    percentComplete = 0;
    contentId = '';
    nextAction = 'Suggest Transaction';
    createdAt: Date = new Date();
    updatedAt: Date = new Date();

    static fromRecord(record: DraftRecord): Draft {
        const d = new Draft();
        d.id = record.id;
        d.source = record.source;
        d.initialContent = record.initial_content;

        if (record.transformed_content) {
            d.transformedContent = Transaction.fromRecord(record.transformed_content);
            d.nextAction = 'Suggest Again'
        }

        d.transformationCount = record.transformation_count;
        d.percentComplete = record.percent_complete;
        d.contentId = record.content_id;

        d.createdAt = new Date(record.inserted_at);
        d.updatedAt = new Date(record.updated_at);

        return d;
    }
}
