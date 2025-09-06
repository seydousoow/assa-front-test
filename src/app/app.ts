/// <reference types="google.accounts" />

import {Component, ElementRef, inject, OnInit, signal, viewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import CredentialResponse = google.accounts.id.CredentialResponse;

interface IResponse {
  access_token: string;
  expires_in: number;
  nonce: string;
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  private readonly html = viewChild<ElementRef<HTMLElement>>('google');
  private readonly http = inject(HttpClient);
  private readonly nonce = signal<string | undefined>('');

  ngOnInit() {
    this.http.get('http://localhost:9090/v1/oidc/nonce').subscribe({
      next: data => {
        this.nonce.set(String(data));
        this.initGoogleOauth(String(data));
      },
      error: error => console.error('There was an error!', error)
    });
  }

  logout() {
    google.accounts.id.revoke("revoke", s => console.log(s));
  }

  private initGoogleOauth(nonce: string): void {
    google.accounts.id.initialize({
      client_id: '378670455235-j7n8bmrbre29kk6vqjk5bmkng461t237.apps.googleusercontent.com', // to be externalized
      auto_select: false,
      ux_mode: 'popup',
      nonce,
      context: "signin",
      itp_support: false,
      login_uri: 'https://assa-front.dicortex.com',
      callback: ({credential}: CredentialResponse) => {
        this.http.post<IResponse>('http://localhost:9090/v1/oidc/google', {credential, nonce: this.nonce()}).subscribe({
          next: data => {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('token_type', 'Bearer');
            localStorage.setItem('expries_in', data.access_token);
            localStorage.setItem('nonce', data.nonce);
          }
        });
      }
    });

    const host = this.html()?.nativeElement;
    if (host) {
      google.accounts.id.renderButton(<HTMLDivElement>host, {
        theme: 'outline', size: 'large', shape: 'square', locale: 'fr', type: 'icon', width: 48
      });
    }
    google.accounts.id.disableAutoSelect();
  }

}
