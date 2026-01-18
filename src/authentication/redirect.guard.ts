import { inject, Injectable } from '@angular/core';
import { from, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from "./authentication.service";

@Injectable({providedIn: 'root'})
export class RedirectGuard {
  private readonly authService = inject(AuthenticationService);
  private readonly router = inject(Router);

  hasValidToken(): Observable<boolean> {
    return from(this.authService.validateToken()).pipe(
      tap((isValid) => {
        if (!isValid) {
          this.authService.logout();
          void this.router.navigate(['/auth']);
        } else {
          void this.router.navigate(['/about']);
        }
      })
    );
  }
}

export const canRedirect = (redirectService = inject(RedirectGuard)) => redirectService.hasValidToken();
