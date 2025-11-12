import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Carica l'utente dal localStorage all'avvio
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { email, password });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        // Salva i token nel localStorage
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token disponibile'));
    }
    
    return this.http.post<{ access_token: string; refresh_token: string }>(
      `${this.apiUrl}/refresh`,
      { refresh_token: refreshToken }
    ).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearLocalStorage();
        this.router.navigate(['/login']);
      })
    );
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request-password-reset`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  confirmEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/confirm-email`, { params: { token } });
  }

  changePassword(email: string, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { email, oldPassword, newPassword });
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private clearLocalStorage(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
