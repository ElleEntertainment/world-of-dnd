import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user || !user.email) return false;

    const admins = (this.config.get<string>('ADMIN_EMAILS') || '').split(',').map(s => s.trim()).filter(Boolean);
    return admins.includes(user.email);
  }
}
