/// <reference types="google.accounts" />

import {Component, ElementRef, inject, OnInit, signal, viewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  private readonly html = viewChild<ElementRef<HTMLElement>>('google');
  private readonly http = inject(HttpClient);
  protected readonly nonce = signal<string | undefined>('');

  ngOnInit() {
    this.http.get('http://localhost:9090/v1/oidc/nonce').subscribe({
      next: data => {
        this.nonce.set(String(data));
        this.initGoogleOauth(String(data));
      },
      error: error => console.error('There was an error!', error)
    });
  }

  // requestTokenAccess(): void {
  //   const client = google.accounts.oauth2.initTokenClient({
  //     client_id: '378670455235-j7n8bmrbre29kk6vqjk5bmkng461t237.apps.googleusercontent.com',
  //     scope: 'profile email openid',
  //     state: this.nonce(),
  //     callback: (response: google.accounts.oauth2.TokenResponse) => {
  //       console.log(response);
  //     },
  //     error_callback: (error: any) => {
  //       console.error('Token Error: ', error);
  //     }
  //   } as google.accounts.oauth2.TokenClientConfig);
  //   client.requestAccessToken();
  // }

  logout() {
    google.accounts.id.revoke("revoke", s => console.log(s));
  }

  private initGoogleOauth(nonce: string): void {
    google.accounts.id.initialize({
      client_id: '378670455235-j7n8bmrbre29kk6vqjk5bmkng461t237.apps.googleusercontent.com',
      ux_mode: 'popup',
      nonce,
      context: "signin",
      itp_support: false,
      login_uri: 'https://assa-front.dicortex.com',
      auto_select: true,
      callback: this.handleCredentialResponse
    });

    const host = this.html()?.nativeElement;
    if (host) {
      google.accounts.id.renderButton(<HTMLDivElement>host, {
        theme: 'outline', size: 'large', shape: 'square', locale: 'fr', type: 'icon', width: 48
      });
    }
    google.accounts.id.prompt()
  }

  private handleCredentialResponse({credential, select_by}: google.accounts.id.CredentialResponse): void {
    console.log('Encoded JWT ID token: ' + credential + ' Select by: ' + select_by);
    // Optionally store the credential in the browser for future use
    google.accounts.id.storeCredential({id: credential, password: ''});

  }

}
