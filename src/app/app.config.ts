import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { OAuthStorage, provideOAuthClient } from "angular-oauth2-oidc";
import { registerLocaleData } from "@angular/common";
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';
import { AuthenticationService } from "../authentication/authentication.service";
import { authInterceptor } from "../authentication/auth.interceptor";

const appInitializer = async () => {
  registerLocales();
  const authService = inject(AuthenticationService);
  authService.initialize();
};

const registerLocales = () => {
  registerLocaleData(localeFr);
  registerLocaleData(localeEn);
};

export function storageFactory(): OAuthStorage {
  return localStorage
}

export const provideInitializer = () => provideAppInitializer(() => appInitializer());

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideOAuthClient(),
    provideInitializer(),
    {provide: OAuthStorage, useFactory: storageFactory}
  ]
};
