import { Observable, map, throwError, catchError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Tag } from './tag';
import { TagRecord, ApiResponse } from './app.types';

type TagList = Tag[];
type ListResponse = ApiResponse<TagRecord[]>;

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor(private http: HttpClient) {
  }

  getTags(): Observable<TagList> {
    return this.http.get<ListResponse>('/api/tags').pipe(
      map((response): TagList => {
        return response.data.map(record => Tag.fromRecord(record));
      }),
      catchError(this.handleError)
    );
  }

  saveTag(tag: Tag): Observable<void> {
    let request = this.http.put<void>(`/api/tags/${tag.id}`, tag.formData);
    return request.pipe(
      catchError(this.handleError)
    );
  }

  deleteTag(id: number): Observable<void> {
    return this.http.delete<void>(`/api/tags/${id}`).pipe(
      catchError(this.handleError)
    );
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
