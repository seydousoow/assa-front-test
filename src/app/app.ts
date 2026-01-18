import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthenticationService } from "../authentication/authentication.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterOutlet, RouterLink, RouterLinkActive]
})
export class App {

  private readonly authenticationService = inject(AuthenticationService);

  get isLoggedIn(): boolean {
    return this.authenticationService.isLoggedIn();
  }

  login(): void {
    this.authenticationService.login();
  }

  logout(): void {
    this.authenticationService.logout();
  }
}
