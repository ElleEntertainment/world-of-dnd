import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Parse cookies so we can read auth token from cookie for server-rendered admin pages
  app.use(cookieParser());

  // Simple middleware: protect server-rendered admin pages (but not /admin/api) and redirect to /admin/login when no valid token
  // Uses jsonwebtoken to verify token server-side so views can redirect instead of returning JSON 401 from guards.
  const jwt = require('jsonwebtoken');
  app.use((req, res, next) => {
    const url = (req.originalUrl || req.url || '').toString();
    // Only handle top-level admin views (exclude API, the token setter and the login page itself)
    if (
      url.startsWith('/admin') &&
      !url.startsWith('/admin/api') &&
      !url.startsWith('/admin/set-token') &&
      !url.startsWith('/admin/login')
    ) {
      const token = (req.cookies && req.cookies.access_token) || (req.headers && (req.headers.authorization || req.headers.Authorization)?.split?.(' ')[1]);
      const secret = process.env.SUPABASE_JWT_SECRET || 'supersecretkey';
      if (!token) {
        return res.redirect('/admin/login');
      }
      try {
        jwt.verify(token, secret);
        return next();
      } catch (err) {
        return res.redirect('/admin/login');
      }
    }
    return next();
  });

  // Serve static assets from backend/public (for admin UI assets if needed)
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  // Configure Handlebars views directory
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // Register Handlebars partials so layout can include separate header/footer partials
  const hbs = require('hbs');
  hbs.registerPartials(join(__dirname, '..', 'views', 'admin', 'partials'));

  // Abilita CORS per permettere le chiamate dal frontend (allow all origins)
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', '*'],
  });
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
