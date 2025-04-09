import { HttpResponse, HttpInterceptorFn, HttpContextToken } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

export const CACHEABLE = new HttpContextToken(() => false);
export const CLEARABLES = new HttpContextToken(() => []);

const cache = new Map();

export const cachingInterceptor: HttpInterceptorFn = (req, next) => {
  for (const url of req.context.get(CLEARABLES)) {
    cache.delete(url);
    console.info(`Cache clear for ${url}`);
  }


  if (req.context.get(CACHEABLE) === false) {
    return next(req);
  }


  const cachedResponse = cache.get(req.url);

  if (cachedResponse) {
    console.info(`Cache hit for ${req.url}`);
    return of(cachedResponse);
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        console.info(`Caching ${req.url}`);
        cache.set(req.url, event);
      }
    })
  );
};
