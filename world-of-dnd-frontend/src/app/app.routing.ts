import { Route } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './shared/guards/auth.guard';

export const appRoutes: Array<Route> = [
  { path: '', pathMatch: 'full', redirectTo: 'landing' },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'landing',
        loadChildren: () =>
          import('./modules/landing/landing.module').then(m => m.LandingModule),
      },
      {
        path: 'auth',
        loadChildren: () =>
          import('./modules/auth/auth.module').then(m => m.AuthModule),
      },
      {
        path: 'game-session',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./modules/game-session/game-session.module').then(m => m.GameSessionModule),
      },
      // Altri moduli qui...
    ],
  },
  { path: '**', redirectTo: 'landing' },
];
