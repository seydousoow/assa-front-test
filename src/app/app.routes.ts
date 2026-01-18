import { Routes } from '@angular/router';
import { canRedirect } from "../authentication/redirect.guard";
import { RedirectComponent } from "../authentication/redirect.component";

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('../authentication/authentication.component').then(m => m.AuthenticationComponent),
  },
  {
    path: 'redirect', component: RedirectComponent, canMatch: [() => canRedirect()]
  },
  {
    path: 'about',
    loadComponent: () => import('../about/about-us.component').then(m => m.AboutUsComponent),
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'about',
  }
];
