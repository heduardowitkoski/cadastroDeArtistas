/** Banco/Auth estritamente em memória. Nenhuma implementação chama Supabase real. */
export function qualityFixture(count = 3) {
  const state = {
    artists: Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      nome: `SMOKE_TEST_Artista ${i + 1}`,
      nome_artistico: `Nome público ${i + 1}`,
      email: `artist${i + 1}@example.test`,
      contato: '53999990000',
      cidade: 'Bagé',
      area_atuacao: i % 2 ? 'Teatro' : 'Música',
      bio: 'Biografia fictícia com mais de vinte caracteres.',
      foto_url: null as string | null,
      instagram: null,
      site: null,
      tags: ['Festival'],
      disponibilidade: ['Fins de semana'],
      status: ['Aprovado', 'Pendente', 'Rejeitado'][i % 3],
      created_at: '2026-10-23T00:00:00Z',
    })) as Record<string, unknown>[],
    feedbacks: [] as Record<string, unknown>[],
    users: new Set<string>(),
    nextId: count + 1,
    databaseFailure: false,
    emailFailure: false,
    emailRequests: [] as unknown[],
  };
  const result = (data: unknown) => ({ data, error: null });
  class Query {
    operation = 'select';
    filters: [string, unknown][] = [];
    payload: Record<string, unknown> = {};
    constructor(readonly table: string) {}
    select() {
      return this;
    }
    eq(column: string, value: unknown) {
      this.filters.push([column, value]);
      return this;
    }
    limit() {
      return this;
    }
    insert(rows: Record<string, unknown>[]) {
      this.operation = 'insert';
      this.payload = rows[0];
      return this;
    }
    update(payload: Record<string, unknown>) {
      this.operation = 'update';
      this.payload = payload;
      return this;
    }
    delete() {
      this.operation = 'delete';
      return this;
    }
    execute() {
      if (state.databaseFailure)
        return {
          data: null,
          error: {
            code: 'fixture_failure',
            message: 'local fixture unavailable',
          },
        };
      const rows = this.table === 'artistas' ? state.artists : state.feedbacks;
      let selected = rows.filter((row) =>
        this.filters.every(([field, value]) => row[field] === value),
      );
      if (this.operation === 'insert') {
        const row = { ...this.payload, id: state.nextId++ };
        rows.push(row);
        selected = [row];
      }
      if (this.operation === 'update')
        selected.forEach((row) => Object.assign(row, this.payload));
      if (this.operation === 'delete')
        selected.forEach((row) => rows.splice(rows.indexOf(row), 1));
      return result(selected.map((row) => ({ ...row })));
    }
    order() {
      return Promise.resolve(this.execute());
    }
    single() {
      const response = this.execute();
      return Promise.resolve({
        ...response,
        data: (response.data as Record<string, unknown>[] | null)?.[0] ?? null,
      });
    }
    then(resolve: (value: unknown) => unknown) {
      return Promise.resolve(this.execute()).then(resolve);
    }
  }
  const authClient = {
    auth: {
      getUser: (token: string) =>
        Promise.resolve(
          token === 'admin-token'
            ? result({
                user: { id: 'admin-fixture', app_metadata: { role: 'admin' } },
              })
            : token === 'common-token'
              ? result({ user: { id: 'common-fixture', app_metadata: {} } })
              : {
                  data: { user: null },
                  error: { message: 'invalid fixture token' },
                },
        ),
      resend: (options: unknown) => {
        state.emailRequests.push(options);
        return Promise.resolve({
          data: {},
          error: state.emailFailure
            ? { message: 'fixture mail failure' }
            : null,
        });
      },
    },
  };
  const databaseClient = {
    from: (table: string) => new Query(table),
    auth: {
      admin: {
        createUser: ({ email }: { email: string }) => {
          if (state.users.has(email))
            return Promise.resolve({
              data: { user: null },
              error: { code: 'email_exists' },
            });
          state.users.add(email);
          return Promise.resolve(result({ user: { id: email } }));
        },
        deleteUser: (id: string) => {
          state.users.delete(id);
          return Promise.resolve({ error: null });
        },
      },
    },
  };
  return {
    state,
    service: {
      getAuthClient: () => authClient,
      getDatabaseClient: () => databaseClient,
    },
  };
}
