import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn((_url: string, key: string) => ({ key })),
}));

describe('SupabaseService', () => {
  const values: Record<string, string> = {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test',
    SUPABASE_SECRET_KEY: 'test-secret-key',
  };

  function config(overrides: Record<string, string | undefined> = {}) {
    return {
      get: (name: string) => ({ ...values, ...overrides })[name],
    } as ConfigService;
  }

  beforeEach(() => jest.clearAllMocks());

  it('falha antes de criar clientes se a chave privilegiada faltar', () => {
    expect(
      () => new SupabaseService(config({ SUPABASE_SECRET_KEY: '' })),
    ).toThrow('Missing Supabase configuration');
    expect(createClient).not.toHaveBeenCalled();
  });

  it('não usa chave legada como fallback da chave pública', () => {
    expect(
      () => new SupabaseService(config({ SUPABASE_PUBLISHABLE_KEY: '' })),
    ).toThrow('Missing Supabase configuration');
    expect(createClient).not.toHaveBeenCalled();
  });

  it('mantém clientes distintos para Auth e banco sem sessão persistente', () => {
    const service = new SupabaseService(config());
    const options = {
      auth: { autoRefreshToken: false, persistSession: false },
    };
    expect(createClient).toHaveBeenNthCalledWith(
      1,
      values.SUPABASE_URL,
      values.SUPABASE_PUBLISHABLE_KEY,
      options,
    );
    expect(createClient).toHaveBeenNthCalledWith(
      2,
      values.SUPABASE_URL,
      values.SUPABASE_SECRET_KEY,
      options,
    );
    expect(service.getAuthClient()).not.toBe(service.getDatabaseClient());
  });
});
