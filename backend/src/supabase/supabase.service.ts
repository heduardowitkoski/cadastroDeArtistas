import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly authClient: SupabaseClient;
  private readonly databaseClient: SupabaseClient;

  constructor(configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL')?.trim();
    const publishableKey = configService
      .get<string>('SUPABASE_PUBLISHABLE_KEY')
      ?.trim();
    const secretKey = configService.get<string>('SUPABASE_SECRET_KEY')?.trim();

    const missing = [
      !supabaseUrl && 'SUPABASE_URL',
      !publishableKey && 'SUPABASE_PUBLISHABLE_KEY',
      !secretKey && 'SUPABASE_SECRET_KEY',
    ].filter(Boolean);
    if (!supabaseUrl || !publishableKey || !secretKey) {
      throw new Error(`Missing Supabase configuration: ${missing.join(', ')}`);
    }

    const options = {
      auth: { autoRefreshToken: false, persistSession: false },
    };
    this.authClient = createClient(
      supabaseUrl,
      publishableKey,
      options,
    ) as SupabaseClient;
    this.databaseClient = createClient(
      supabaseUrl,
      secretKey,
      options,
    ) as SupabaseClient;
  }

  getAuthClient(): SupabaseClient {
    return this.authClient;
  }

  getDatabaseClient(): SupabaseClient {
    return this.databaseClient;
  }
}
