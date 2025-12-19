import { Observable, map, throwError, catchError } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import {
    HttpClient,
    HttpContext,
    HttpErrorResponse,
    HttpParams,
} from '@angular/common/http';
import { Tag } from './tag';
import { TagRecord, ApiResponse } from './app.types';
import { CACHEABLE, CLEARABLES } from './caching.interceptor';

type TagList = Tag[];
type ListResponse = ApiResponse<TagRecord[]>;

@Injectable({
    providedIn: 'root',
})
export class TagService {
    private http = inject(HttpClient);

    cacheableContext(): HttpContext {
        return new HttpContext().set(CACHEABLE, true);
    }

    clearableContext(): HttpContext {
        return new HttpContext().set(CLEARABLES, ['/api/tags']);
    }

    autocomplete(name: string): Observable<TagList> {
        let params = new HttpParams();
        params = params.set('name', name);

        return this.http
            .get<ListResponse>('/api/tags/autocomplete', { params })
            .pipe(
                map((response): TagList => {
                    return response.data.map((record) =>
                        Tag.fromRecord(record),
                    );
                }),
                catchError(this.handleError),
            );
    }

    getTags(): Observable<TagList> {
        const context = this.cacheableContext();
        return this.http.get<ListResponse>('/api/tags', { context }).pipe(
            map((response): TagList => {
                return response.data.map((record) => Tag.fromRecord(record));
            }),
            catchError(this.handleError),
        );
    }

    saveTag(tag: Tag): Observable<void> {
        const context = this.clearableContext();
        const request = this.http.put<void>(
            `/api/tags/${tag.id}`,
            tag.formData,
            {
                context,
            },
        );
        return request.pipe(catchError(this.handleError));
    }

    deleteTag(id: number): Observable<void> {
        return this.http
            .delete<void>(`/api/tags/${id}`)
            .pipe(catchError(this.handleError));
    }

    handleError(error: HttpErrorResponse) {
        console.error('handleError', error);
        let message = '';
        if (error.error instanceof ErrorEvent) {
            message = error.error.message;
        } else {
            message = error.message;
        }
        console.error(message);
        return throwError(() => new Error('Something went wrong.'));
    }
}
