import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn((_url: string, key: string) => ({ key })),
}));

describe('SupabaseService', () => {
  const values: Record<string, string> = {
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
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
    ).toThrow('Missing Supabase configuration: SUPABASE_SECRET_KEY');
    expect(createClient).not.toHaveBeenCalled();
  });

  it('falha antes de criar clientes se a URL faltar', () => {
    expect(() => new SupabaseService(config({ SUPABASE_URL: '  ' }))).toThrow(
      'Missing Supabase configuration: SUPABASE_URL',
    );
    expect(createClient).not.toHaveBeenCalled();
  });

  it('falha antes de criar clientes se a chave pública faltar', () => {
    expect(
      () => new SupabaseService(config({ SUPABASE_PUBLISHABLE_KEY: '' })),
    ).toThrow('Missing Supabase configuration: SUPABASE_PUBLISHABLE_KEY');
    expect(createClient).not.toHaveBeenCalled();
  });

  it('não usa chaves legadas como fallback', () => {
    const legacy = {
      SUPABASE_ANON_KEY: 'test-legacy-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'test-legacy-service-key',
    };
    expect(
      () =>
        new SupabaseService(
          config({ ...legacy, SUPABASE_PUBLISHABLE_KEY: undefined }),
        ),
    ).toThrow('Missing Supabase configuration: SUPABASE_PUBLISHABLE_KEY');
    expect(
      () =>
        new SupabaseService(
          config({ ...legacy, SUPABASE_SECRET_KEY: undefined }),
        ),
    ).toThrow('Missing Supabase configuration: SUPABASE_SECRET_KEY');
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
    expect(options).not.toHaveProperty('global');
  });
});
