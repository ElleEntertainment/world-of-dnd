import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  template: '<p>Logging out...</p>',
})
export class LogoutComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Call backend logout and always clear local storage / navigate to login
    this.auth.logout().subscribe({
      next: () => {
        try {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('currentUser');
        } catch (e) {}
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        try {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('currentUser');
        } catch (e) {}
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
