import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
const cookieParser = require('cookie-parser');
import { AppModule } from './app.module';

async function setupApp(): Promise<any> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Parse cookies so we can read auth token from cookie for server-rendered admin pages
  app.use(cookieParser());

  // Simple middleware: protect server-rendered admin pages (but not /admin/api) and redirect to /admin/login when no valid token
  const jwt = require('jsonwebtoken');
  app.use((req, res, next) => {
    const url = (req.originalUrl || req.url || '').toString();
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

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', '*'],
  });

  await app.init();
  return app.getHttpAdapter().getInstance();
}

// Export a serverless-compatible handler for Vercel
let serverInstance: any = null;
export default async function handler(req: any, res: any) {
  if (!serverInstance) {
    serverInstance = await setupApp();
  }
  return serverInstance(req, res);
}

// When run directly (local dev), listen on a port
if (require.main === module) {
  (async () => {
    const server = await setupApp();
    const port = process.env.PORT ?? 3000;
    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Application is running on: http://localhost:${port}`);
    });
  })();
}
