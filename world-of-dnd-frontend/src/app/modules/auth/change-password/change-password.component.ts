import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  standalone: false
})
export class ChangePasswordComponent {
  email = '';
  oldPassword = '';
  newPassword = '';
  message = '';
  error = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.changePassword(this.email, this.oldPassword, this.newPassword).subscribe({
      next: (res) => {
        this.message = res.message || 'Password aggiornata con successo';
        this.error = '';
      },
      error: (err) => {
        this.error = err.error?.message || 'Errore durante il cambio password';
        this.message = '';
      },
    });
  }
}
