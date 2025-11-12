import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Aggiungi il token di accesso alle richieste se disponibile
    const token = this.authService.getAccessToken();
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshToken().pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;
            // Salva il nuovo token nello subject e ripeti la request originale
            this.refreshTokenSubject.next(response.access_token);
            return next.handle(this.addToken(request, response.access_token));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            // Se il refresh fallisce, forza logout e fallisci la request originale
            this.authService.logout().subscribe({
              next: () => {},
              error: () => {}
            });
            return throwError(() => err);
          })
        );
      } else {
        // Nessun refresh token disponibile: effettua logout e fallisci subito
        this.isRefreshing = false;
        this.authService.logout().subscribe({
          next: () => {},
          error: () => {}
        });
        return throwError(() => new Error('Nessun refresh token disponibile'));
      }
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addToken(request, token)))
    );
  }
}
