import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorTuple } from './app.types';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSubject = new Subject<ErrorTuple>();
  error$ = this.errorSubject.asObservable();

  constructor() { }

  reportError(error: HttpErrorResponse, message?: string) {
    this.errorSubject.next([error, message]);
  }
}
