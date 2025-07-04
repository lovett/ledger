import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, pipe } from 'rxjs';
import { Draft } from './draft';
import { DraftRecord, ApiResponse } from './app.types';

type DraftList = Draft[];
type ListResponse = ApiResponse<DraftRecord[]>;

@Injectable({
  providedIn: 'root'
})
export class DraftService {

    constructor(private http: HttpClient) {}

    getCount(): Observable<number> {
        return this.http
            .get<number>('/api/drafts/count');
    }

    getDrafts(): Observable<DraftList> {
        let params = new HttpParams();

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
        return this.http.delete<void>(`/api/drafts/${id}`);
    }
}
