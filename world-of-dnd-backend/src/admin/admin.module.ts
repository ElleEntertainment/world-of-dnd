import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../core/auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminApiController } from './admin.api.controller';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminController, AdminApiController],
  providers: [AdminGuard],
})
export class AdminModule {}
