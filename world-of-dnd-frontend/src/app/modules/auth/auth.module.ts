import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { LogoutComponent } from './logout/logout.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'logout', component: LogoutComponent },
];

@NgModule({
  declarations: [LoginComponent, RegisterComponent, ChangePasswordComponent, LogoutComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule
  ],
  exports: [LoginComponent, RegisterComponent, ChangePasswordComponent, LogoutComponent]
})
export class AuthModule {}
