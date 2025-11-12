import { Controller, Get, Req, Res, Post, Body } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('admin')
export class AdminController {
  constructor(private jwtService: JwtService, private config: ConfigService) {}

  private extractToken(req: any): string | null {
    // prefer cookie named access_token, then Authorization header
    if (req.cookies && req.cookies.access_token) return req.cookies.access_token;
    const auth = req.headers && (req.headers.authorization || req.headers.Authorization);
    if (!auth) return null;
    const parts = auth.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') return parts[1];
    return null;
  }

  private validateToken(token: string | null) {
    if (!token) return null;
    try {
      return this.jwtService.verify(token, {
        secret: this.config.get<string>('SUPABASE_JWT_SECRET') || 'supersecretkey',
      });
    } catch (e) {
      return null;
    }
  }

  // Endpoint used by the admin login page to set cookies server-side.
  // This avoids relying on localStorage for server-side rendered pages.
  @Post('set-token')
  async setToken(@Body() body: { access_token?: string; refresh_token?: string }, @Res() res: any) {
    const { access_token, refresh_token } = body || {};
    if (access_token) {
      res.cookie('access_token', access_token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 3600 * 1000, // 1 day
      });
    }
    if (refresh_token) {
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 3600 * 1000, // 30 days
      });
    }
    return res.json({ ok: true });
  }

  // Dashboard - redirect to login if not authenticated
  @Get()
  async index(@Req() req: any, @Res() res: any) {
    const token = this.extractToken(req);
    const payload = this.validateToken(token);
    if (!payload) return res.redirect('/admin/login');
    return res.render('admin/index', { layout: 'admin/layout', user: { email: payload.email } });
  }

  // Login page - if already authenticated redirect to admin dashboard
  @Get('login')
  async login(@Req() req: any, @Res() res: any) {
    const token = this.extractToken(req);
    const payload = this.validateToken(token);
    if (payload) return res.redirect('/admin');
    // Render login without the admin sidebar (noSidebar flag used by layout.hbs)
    return res.render('admin/login', { layout: 'admin/layout', noSidebar: true });
  }

  @Get('spells')
  async spells(@Req() req: any, @Res() res: any) {
    const token = this.extractToken(req);
    const payload = this.validateToken(token);
    if (!payload) return res.redirect('/admin/login');
    return res.render('admin/spells', { layout: 'admin/layout', user: { email: payload.email } });
  }

  @Get('talents')
  async talents(@Req() req: any, @Res() res: any) {
    const token = this.extractToken(req);
    const payload = this.validateToken(token);
    if (!payload) return res.redirect('/admin/login');
    return res.render('admin/talents', { layout: 'admin/layout', user: { email: payload.email } });
  }

  @Get('users')
  async users(@Req() req: any, @Res() res: any) {
    const token = this.extractToken(req);
    const payload = this.validateToken(token);
    if (!payload) return res.redirect('/admin/login');
    return res.render('admin/users', { layout: 'admin/layout', user: { email: payload.email } });
  }

  // Logout: clear auth cookies and redirect to login
  @Get('logout')
  async logout(@Req() req: any, @Res() res: any) {
    try {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
    } catch (e) {
      // ignore cookie clear errors
    }
    return res.redirect('/admin/login');
  }
}
