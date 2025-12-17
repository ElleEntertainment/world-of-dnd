import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Six days in milliseconds (6 * 24h * 60m * 60s * 1000ms)
const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;

@Injectable()
export class HeartbeatService implements OnModuleInit {
  private readonly logger = new Logger(HeartbeatService.name);
  private readonly supabase: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    const supabaseUrl = this.config.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      this.logger.warn('Supabase heartbeat disabled: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    this.supabase = createClient(supabaseUrl ?? '', serviceRoleKey ?? '');
  }

  async onModuleInit() {
    await this.pingSupabase('startup');
  }

  @Interval(SIX_DAYS_MS)
  async scheduledPing() {
    await this.pingSupabase('interval');
  }

  private async pingSupabase(reason: 'startup' | 'interval') {
    // Skip if configuration is incomplete
    if (!this.supabase || !(this.config.get('SUPABASE_URL') && this.config.get('SUPABASE_SERVICE_ROLE_KEY'))) {
      return;
    }

    try {
      // Perform a lightweight read on the users table to count a real access
      const { error } = await this.supabase.from('users').select('id').limit(1);

      if (error) {
        throw error;
      }

      this.logger.log(`Supabase heartbeat (${reason}) succeeded`);
    } catch (err) {
      this.logger.warn(`Supabase heartbeat (${reason}) failed: ${err?.message ?? err}`);
    }
  }
}
