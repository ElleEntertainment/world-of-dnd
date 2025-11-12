import { Controller, Post, Body, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    return this.authService.logout(req.user.userId);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: { email: string }) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Get('confirm-email')
  async confirmEmail(@Query('token') token: string) {
    return this.authService.confirmEmail(token);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() body: { email: string; oldPassword: string; newPassword: string }
  ) {
    return this.authService.changePassword(body.email, body.oldPassword, body.newPassword);
  }
}
