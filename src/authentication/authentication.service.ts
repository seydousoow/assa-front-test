import { DestroyRef, inject, Injectable, OnDestroy } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { isAfter } from "date-fns";

const FRONT_IP = 'https://assa-front.dicortex.com';
// const FRONT_IP = 'http://localhost:4200';

@Injectable({providedIn: 'root'})
export class AuthenticationService implements OnDestroy {
  private subscription?: Subscription;

  private readonly oAuthService = inject(OAuthService);
  private readonly router = inject(Router);
  private readonly ref$ = inject(DestroyRef);

  get accessToken(): string {
    return this.oAuthService.getAccessToken();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  initialize(): void {
    const authConfig = this.buildPKCEConfig();
    this.oAuthService.configure(authConfig);
    this.oAuthService.setupAutomaticSilentRefresh();
    this.oAuthService.events.pipe(takeUntilDestroyed(this.ref$)).subscribe(({type: eventType}) => {
      console.log(`event type ${eventType}`)
      if (eventType === 'token_expires' && !this.oAuthService.hasValidAccessToken()) {
        void this.router.navigate(['/', 'auth']);
      }
    });
  }

  isLoggedIn(): boolean {
    console.log(this.oAuthService.hasValidAccessToken(), this.oAuthService.getAccessTokenExpiration(), this.isTokenExpired());
    return this.oAuthService.hasValidAccessToken();
  }

  login(): void {
    this.oAuthService.initCodeFlow();
  }

  isTokenExpired(): boolean {
    return isAfter(new Date(), new Date(this.oAuthService.getAccessTokenExpiration()));
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.oAuthService.tryLoginCodeFlow();
      return Promise.resolve(true);
    } catch {
      return Promise.resolve(false);
    }
  }

  logout(): void {
    void this.oAuthService.revokeTokenAndLogout();
  }

  private buildPKCEConfig = (): AuthConfig => ({
    issuer: "https://assa-auth.dicortex.com",
    loginUrl: "https://assa-auth.dicortex.com/oauth2/authorize",
    logoutUrl: "https://assa-auth.dicortex.com/connect/logout",
    tokenEndpoint: "https://assa-auth.dicortex.com/oauth2/token",
    revocationEndpoint: "https://assa-auth.dicortex.com/oauth2/revoke",
    resource: "https://assa-auth.dicortex.com/airsenegal",
    clientId: "3adabccc-cc62-6708-0a8c-6deb36b372d5",
    scope: 'openid profile email',
    responseType: 'code',
    redirectUri: `${FRONT_IP}/redirect`,
    postLogoutRedirectUri: FRONT_IP,
  });
}
