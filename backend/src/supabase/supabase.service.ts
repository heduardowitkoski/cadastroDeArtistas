import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly authClient: SupabaseClient;
  private readonly databaseClient: SupabaseClient;

  constructor(configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const publishableKey = configService.get<string>(
      'SUPABASE_PUBLISHABLE_KEY',
    );
    const secretKey = configService.get<string>('SUPABASE_SECRET_KEY');

    if (!supabaseUrl || !publishableKey || !secretKey) {
      throw new Error('Missing Supabase configuration');
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
