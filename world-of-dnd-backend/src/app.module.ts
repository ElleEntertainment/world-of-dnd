import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './core/auth/auth.module';
import { GameSessionModule } from './core/game-session/game-session.module';
import { AdminModule } from './admin/admin.module';
import { HeartbeatModule } from './core/heartbeat/heartbeat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    GameSessionModule,
    AdminModule,
    HeartbeatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
