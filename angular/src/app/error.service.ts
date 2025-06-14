import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorTuple } from './app.types';

@Injectable({
    providedIn: 'root',
})
export class ErrorService {
    private errorSubject = new Subject<ErrorTuple>();
    error$ = this.errorSubject.asObservable();

    reportError(error: HttpErrorResponse, message?: string) {
        console.log(error);
        this.errorSubject.next([error, message]);
    }
}
