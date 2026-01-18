import { Component, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { JsonPipe } from "@angular/common";
import { AuthenticationService } from "./authentication.service";

const USER_URL = 'https://assa-user.dicortex.com/v1/users/current';
// const USER_URL = 'http://localhost:8081/v1/users/current';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  imports: [JsonPipe]
})
export class AuthenticationComponent {
  readonly currentUser = signal<any | undefined>(undefined);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthenticationService);

  constructor() {
    if (this.authService.isLoggedIn()) {
      this.http.get<any>(USER_URL, {headers: {Authorization: `Bearer ${this.authService.accessToken}`}}).subscribe({
        next: data => {
          this.currentUser.set(data);
        },
        error: error => {
          console.error('There was an error!', error);
        }
      });
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

}
