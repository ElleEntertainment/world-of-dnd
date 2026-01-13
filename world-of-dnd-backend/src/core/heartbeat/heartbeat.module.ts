import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HeartbeatService } from './heartbeat.service';
import { HeartbeatController } from './heartbeat.controller';

@Module({
    imports: [ConfigModule],
    providers: [HeartbeatService],
    controllers: [HeartbeatController],
})
export class HeartbeatModule { }
