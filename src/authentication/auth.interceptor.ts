import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpHeaders, HttpRequest } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from "./authentication.service";

const TIMEOUT_STATUS: number[] = [
  0, // Angular CORS or internal error
  408, // Request Timeout
  503, // Service Unavailable
  504, // Gateway Timeout
  522, // Connection timed out
];

const AUTH_ROUTES = {
  notAvailable: 'not-available',
  expired: 'expired',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
};

function isTimeoutError(status: number): boolean {
  return TIMEOUT_STATUS.includes(status);
}

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  const headers = buildHeaders();
  const request = req.clone({headers});
  return next(request).pipe(catchError((error) => {
    console.log(error)
    return of(error);
  }));
}

function buildHeaders(): HttpHeaders {
  const authService = inject(AuthenticationService);

  if (authService.isLoggedIn()) {
    return new HttpHeaders({Authorization: `Bearer ${authService.accessToken}`, 'X-Client-source': 'WEB'});
  }
  return new HttpHeaders({'X-Client-source': 'WEB'});
}

// function handleError(
//   error: HttpErrorResponse,
//   authService: AuthenticationService,
//   router: Router
// ): Observable<never> {
//   // Because the API possibly returns a different status in body.
//   const status = error.error?.status ?? error.status;
//
//   if (error.status === undefined) {
//     return throwError(() => error);
//   }
//
//   const message = error.error?.message;
//
//   if (isTimeoutError(status)) {
//     void router.navigateByUrl('/');
//   } else if (status === 401) {
//     authService.logout(true);
//     void router.navigateByUrl(message?.includes('expired') ? `/${AUTH_ROUTES.expired}` : `/${AUTH_ROUTES.unauthorized}`);
//   } else if (status === 403) {
//     void router.navigateByUrl(`/${AUTH_ROUTES.forbidden}`);
//   }
//   return throwError(() => error);
// }
