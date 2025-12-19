/// <reference types="google.accounts" />

import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { JsonPipe } from "@angular/common";
import { addMinutes } from "date-fns";
import { startWith, Subject, switchMap, tap, throwError } from "rxjs";

interface IResponse {
  access_token: string;
  expires_in: Date;
  nonce: string;
  type: string;
}

const LOGIN_URI = 'https://assa-front.dicortex.com';
const CLIENT_ID = '378670455235-j7n8bmrbre29kk6vqjk5bmkng461t237.apps.googleusercontent.com';
const BASE_URL = 'https://assa-auth.dicortex.com';
// const BASE_URL = 'http://localhost:9090';
const USER_URL = 'https://assa-user.dicortex.com/v1/users/current';
// const USER_URL = 'http://localhost:8081/v1/users/current';

@Component({
  selector: 'app-root',
  imports: [JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  readonly response = signal<IResponse | undefined>(undefined);
  readonly currentUser = signal<any | undefined>(undefined);
  private readonly obd$ = new Subject<IResponse | undefined>()
  private readonly html = viewChild<ElementRef<HTMLElement>>('google');
  private readonly http = inject(HttpClient);
  private readonly nonce = signal<string | undefined>('');

  constructor() {
    let v: IResponse | undefined = undefined;
    const token = localStorage.getItem('access_token');
    if (token) {
      v = {access_token: token, type: localStorage.getItem('token_type') ?? '', nonce: '', expires_in: new Date()};
    }
    this.obd$.pipe(
        startWith(v),
        tap(s => this.response.set(s)),
        switchMap((data) => {
          if (!data) {
            return throwError(() => "invalid token");
          }
          return this.http.get<any>(USER_URL, {headers: {'Authorization': `${data.type} ${data.access_token}`}});
        })
    ).subscribe({
      next: data => {
        google.accounts.id.cancel();
        this.currentUser.set(data);
      },
      error: error => {
        console.error('There was an error!', error);
        this.initGoogleOauth()
      }
    });
  }

  logout() {
    this.http.post<void>(`${BASE_URL}/v1/auth/logout`, {nonce: localStorage.getItem('nonce') ?? ''}, {headers: {'Authorization': `${this.response()?.type} ${this.response()?.access_token}`}}).subscribe({
      error: error => console.error('There was an error!', error)
    });
    ['access_token', 'token_type', 'expires_in', 'nonce'].forEach(key => localStorage.removeItem(key));
    this.obd$.next(undefined);
    this.currentUser.set(undefined);
  }

  private initGoogleOauth(): void {
    this.http.get(`${BASE_URL}/v1/oidc/nonce`, {responseType: 'text'}).subscribe({
      next: data => {
        this.nonce.set(data);
        this.buildGoogleButton(data);
      },
      error: error => console.error('There was an error!', error)
    });
  }

  private buildGoogleButton(nonce: string): void {
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      auto_select: false,
      ux_mode: 'popup',
      nonce,
      context: "signin",
      itp_support: false,
      login_uri: LOGIN_URI,
      callback: ({credential}) => this.authentication(credential)
    });

    const host = this.html()?.nativeElement;
    if (host) {
      google.accounts.id.renderButton(<HTMLDivElement>host, {theme: 'outline', size: 'large', shape: 'square', locale: 'fr', type: 'icon', width: 48});
    }
    google.accounts.id.disableAutoSelect();
  }

  private authentication(credential: string): void {
    this.http.post<any>(`${BASE_URL}/v1/oidc/google`, {credential, nonce: this.nonce()}).subscribe({
      next: data => {
        const expires_in = addMinutes(new Date(), data.expires_in);
        this.obd$.next({...data, expires_in});
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_type', data.type);
        localStorage.setItem('expires_in', JSON.stringify(expires_in));
        localStorage.setItem('nonce', data.nonce);
      }, error: err => console.log('Authentication Error: ', err)
    });
  }

}
