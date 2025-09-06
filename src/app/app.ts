/// <reference types="google.accounts" />

import {Component, inject, OnInit, signal} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  readonly nonce = signal('');
  readonly clientId: Readonly<string> = "378670455235-j7n8bmrbre29kk6vqjk5bmkng461t237.apps.googleusercontent.com";
  private readonly http = inject(HttpClient);

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

  ngOnInit() {
    this.http.get('http://localhost:9090/v1/oidc/nonce').subscribe({
      next: data => this.nonce.set(String(data)),
      error: error => console.error('There was an error!', error)
    });
  }

  logout() {
    google.accounts.id.revoke("revoke", s => console.log(s));
  }

  // noinspection JSUnusedLocalSymbols
  private handleCredentialResponse({credential, select_by}: google.accounts.id.CredentialResponse): void {
    console.log('Encoded JWT ID token: ' + credential + ' Select by: ' + select_by);
    // Optionally store the credential in the browser for future use
    google.accounts.id.storeCredential({id: credential, password: ''} as google.accounts.id.Credential);

  }

}
