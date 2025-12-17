import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HeartbeatService } from './heartbeat.service';

@Module({
  imports: [ConfigModule],
  providers: [HeartbeatService],
})
export class HeartbeatModule {}
