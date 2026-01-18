import { Component, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AuthenticationService } from "../authentication/authentication.service";

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  imports: []
})
export class AboutUsComponent {

  readonly loading = signal(false);
  private readonly http = inject(HttpClient);
  private readonly i = inject(AuthenticationService);

}