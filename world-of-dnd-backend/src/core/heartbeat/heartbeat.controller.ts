import { Controller, Get, Query, UnauthorizedException } from '@nestjs/common';
import { HeartbeatService } from './heartbeat.service';
import { ConfigService } from '@nestjs/config';

@Controller('heartbeat')
export class HeartbeatController {
    constructor(
        private readonly heartbeatService: HeartbeatService,
        private readonly config: ConfigService,
    ) { }

    @Get('ping')
    async ping(@Query('key') key: string) {
        const cronKey = this.config.get<string>('CRON_SECRET');

        // Simple security check to avoid public spamming, if a secret is configured
        if (cronKey && key !== cronKey) {
            throw new UnauthorizedException('Invalid cron key');
        }

        await this.heartbeatService.pingSupabase('cron');
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
}
