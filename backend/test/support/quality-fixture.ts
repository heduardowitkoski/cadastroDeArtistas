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
    media: [] as Record<string, unknown>[],
    events: [] as Record<string, unknown>[],
    stats: [] as Record<string, unknown>[],
    viewSessions: new Set<string>(),
    sessionRows: [] as Record<string, unknown>[],
    cleanupJobs: [] as Record<string, unknown>[],
    objects: new Map<string, Buffer>(),
    storageFailure: false,
    removeFailure: false,
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
    predicates: Array<(row: Record<string, unknown>) => boolean> = [];
    maximum = Infinity;
    ordering: { column: string; ascending: boolean } | null = null;
    payload: Record<string, unknown> = {};
    constructor(readonly table: string) {}
    select() {
      return this;
    }
    eq(column: string, value: unknown) {
      this.filters.push([column, value]);
      return this;
    }
    limit(count?: number) {
      this.maximum = count ?? Infinity;
      return this;
    }
    in(column: string, values: unknown[]) {
      this.predicates.push((row) => values.includes(row[column]));
      return this;
    }
    lt(column: string, value: string) {
      this.predicates.push((row) => String(row[column]) < value);
      return this;
    }
    gte(column: string, value: string) {
      this.predicates.push((row) => String(row[column]) >= value);
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
      const tables: Record<string, Record<string, unknown>[]> = {
        artistas: state.artists,
        feedbacks: state.feedbacks,
        artist_media: state.media,
        artist_events: state.events,
        artist_profile_stats: state.stats,
        artist_media_cleanup: state.cleanupJobs,
        artist_view_sessions: state.sessionRows,
      };
      const rows = tables[this.table];
      if (!rows) throw new Error('Unimplemented fixture table ' + this.table);
      let selected = rows.filter(
        (row) =>
          this.filters.every(([field, value]) => row[field] === value) &&
          this.predicates.every((test) => test(row)),
      );
      if (this.operation === 'insert') {
        const row = {
          ...this.payload,
          id: this.payload.id ?? state.nextId++,
          created_at: new Date().toISOString(),
        };
        rows.push(row);
        selected = [row];
      }
      if (this.operation === 'update')
        selected.forEach((row) => Object.assign(row, this.payload));
      if (this.operation === 'delete') {
        selected.forEach((row) => rows.splice(rows.indexOf(row), 1));
        if (this.table === 'artistas')
          for (const row of selected) {
            for (const table of [state.media, state.events, state.stats])
              for (let i = table.length - 1; i >= 0; i--)
                if (table[i].artist_id === row.id) table.splice(i, 1);
          }
      }
      if (this.ordering) {
        const { column, ascending } = this.ordering;
        selected.sort(
          (a, b) =>
            String(a[column]).localeCompare(String(b[column])) *
            (ascending ? 1 : -1),
        );
      }
      selected = selected.slice(0, this.maximum);
      return result(selected.map((row) => ({ ...row })));
    }
    order(column: string, options: { ascending: boolean }) {
      this.ordering = { column, ascending: options.ascending };
      return this;
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
    storage: {
      from: () => ({
        upload: (path: string, buffer: Buffer) => {
          if (state.storageFailure)
            return Promise.resolve({
              data: null,
              error: { message: 'fixture storage failure' },
            });
          state.objects.set(path, buffer);
          return Promise.resolve(result({ path }));
        },
        download: (path: string) =>
          Promise.resolve(
            state.objects.has(path)
              ? result(new Blob([new Uint8Array(state.objects.get(path)!)]))
              : { data: null, error: { message: 'missing fixture object' } },
          ),
        remove: (paths: string[]) => {
          if (state.removeFailure)
            return Promise.resolve({
              data: null,
              error: { message: 'fixture cleanup failure' },
            });
          paths.forEach((path) => state.objects.delete(path));
          return Promise.resolve(result([]));
        },
      }),
    },
    rpc: (name: string, args: Record<string, unknown>) => {
      const artist = state.artists.find((a) => a.id === args.p_artist_id);
      if (state.databaseFailure)
        return Promise.resolve({
          data: null,
          error: { message: 'fixture db failure' },
        });
      if (name === 'record_artist_view') {
        if (!artist || artist.status !== 'Aprovado')
          return Promise.resolve(result(null));
        const key =
          String(args.p_artist_id) + ':' + String(args.p_session_hash);
        let stat = state.stats.find((s) => s.artist_id === args.p_artist_id);
        if (!stat) {
          stat = { artist_id: args.p_artist_id, views: 0 };
          state.stats.push(stat);
        }
        if (!state.viewSessions.has(key)) {
          state.viewSessions.add(key);
          state.sessionRows.push({
            artist_id: args.p_artist_id,
            session_hash: args.p_session_hash,
            created_at: new Date().toISOString(),
          });
          stat.views = Number(stat.views) + 1;
        }
        return Promise.resolve(result(stat.views));
      }
      if (name === 'attach_artist_media') {
        const rows = args.p_rows as Record<string, unknown>[];
        for (const kind of ['photo', 'gallery', 'portfolio'])
          if (
            [
              ...state.media.filter((m) => m.artist_id === args.p_artist_id),
              ...rows,
            ].filter((m) => m.kind === kind).length >
            (kind === 'gallery' ? 8 : 1)
          )
            return Promise.resolve({
              data: null,
              error: { message: 'fixture media limit' },
            });
        state.media.push(...rows);
        const photo = rows.find((r) => r.kind === 'photo');
        if (photo && artist)
          artist.foto_url = `/artistas/${String(artist.id)}/arquivos/${String(photo.id)}?thumbnail=1`;
        return Promise.resolve(result(null));
      }
      if (name === 'delete_artist_media') {
        const index = state.media.findIndex(
          (m) => m.id === args.p_media_id && m.artist_id === args.p_artist_id,
        );
        if (index >= 0) {
          const row = state.media[index];
          if (row.kind === 'photo' && artist) artist.foto_url = null;
          state.media.splice(index, 1);
        }
        return Promise.resolve(result(null));
      }
      throw new Error('Unimplemented fixture RPC ' + name);
    },
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
