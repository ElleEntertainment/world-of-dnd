import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  message = '';
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    const { email, password } = this.registerForm.value;
    this.authService.register(email, password).subscribe({
      next: (res) => {
        this.message = res.message || 'Registrazione completata. Controlla la mail.';
        this.error = '';
      },
      error: (err) => {
        this.error = err.error?.message || 'Errore di registrazione';
        this.message = '';
      },
    });
  }
}
