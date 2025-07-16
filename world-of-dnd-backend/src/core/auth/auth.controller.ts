import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    // Qui chiamerai la logica di registrazione
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    // Qui chiamerai la logica di login
    return this.authService.login(body.email, body.password);
  }

  @Get('confirm-email')
  async confirmEmail(@Query('token') token: string) {
    // Qui chiamerai la logica di conferma email
    return this.authService.confirmEmail(token);
  }

  @Post('change-password')
  async changePassword(
    @Body() body: { email: string; oldPassword: string; newPassword: string }
  ) {
    return this.authService.changePassword(body.email, body.oldPassword, body.newPassword);
  }
}
