import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Se l'utente è già autenticato, reindirizza a game-session
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/game-session/1']);
      return;
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.error = '';
        // Reindirizza a game-session dopo login con successo
        this.router.navigate(['/game-session/1']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Errore di login';
      },
    });
  }
}
