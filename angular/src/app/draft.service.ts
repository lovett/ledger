import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Draft } from './draft';
import { DraftRecord, ApiResponse } from './app.types';
import { Subject } from 'rxjs';

type DraftList = Draft[];
type ListResponse = ApiResponse<DraftRecord[]>;

@Injectable({
  providedIn: 'root'
})
export class DraftService {
    private draftDeletionSource = new Subject<void>();
    private http = inject(HttpClient);
    draftDeleted$ = this.draftDeletionSource.asObservable();

    getCount(): Observable<number> {
        return this.http
            .get<number>('/api/drafts/count');
    }

    getDrafts(): Observable<DraftList> {
        return this.http
            .get<ListResponse>('/api/drafts')
            .pipe(
                map((response): DraftList => {
                    return response.data.map((record) =>
                        Draft.fromRecord(record),
                    );
                }),
            );
    }

    deleteDraft(id: number): Observable<void> {
        this.draftDeletionSource.next();
        return this.http.delete<void>(`/api/drafts/${id}`);
    }
}
