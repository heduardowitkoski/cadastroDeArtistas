import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { SupabaseService } from './../src/supabase/supabase.service';
import { configureValidation } from './../src/validation/configure-validation';

const approved = {
  id: 1,
  nome: 'Artista aprovado',
  nome_artistico: 'Nome público',
  area_atuacao: 'Música',
  bio: 'Biografia pública',
  foto_url: null,
  instagram: null,
  site: null,
  contato: null,
  cidade: 'Bagé',
  tags: ['MPB'],
  disponibilidade: ['Fins de semana'],
  status: 'Aprovado',
  email: 'privado@example.invalid',
  cpf_cnpj: 'DADO_FICTICIO_PRIVADO',
  created_at: '2026-01-01T00:00:00Z',
};

describe('Proteção da API (integração local, Supabase substituído)', () => {
  let app: INestApplication<App>;
  let insertedArtist: Record<string, unknown> | undefined;
  let authMode: 'ok' | 'duplicate' | 'failure' = 'ok';
  let dbInsertFailure = false;
  let dbInsertThrows = false;
  let existingArtistEmail = false;
  let compensationFailure = false;
  const createdUsers: string[] = [];
  const createdUserOptions: Array<Record<string, unknown>> = [];
  const deletedUsers: string[] = [];
  const selectedColumns: string[] = [];
  const databaseTables: string[] = [];

  class FakeQuery {
    private operation = 'select';
    private statusFilter?: string;
    private payload: Record<string, unknown> = {};
    private recordId?: number;
    private emailFilter?: string;

    constructor(private readonly table: string) {}

    select(columns?: string): this {
      if (columns) selectedColumns.push(columns);
      return this;
    }

    eq(column: string, value: string | number): this {
      if (column === 'status') this.statusFilter = String(value);
      if (column === 'id') this.recordId = Number(value);
      if (column === 'email') this.emailFilter = String(value);
      return this;
    }

    limit(): this {
      return this;
    }

    order() {
      return Promise.resolve({
        data:
          this.table === 'artistas'
            ? this.statusFilter === 'Aprovado'
              ? [approved]
              : [approved, { ...approved, id: 2, status: 'Pendente' }]
            : [{ id: 1, nome: 'Visitante', email: 'privado@example.invalid' }],
        error: null,
      });
    }

    insert(rows: Record<string, unknown>[]): this {
      this.operation = 'insert';
      this.payload = rows[0];
      if (this.table === 'artistas') insertedArtist = this.payload;
      return this;
    }

    update(value: Record<string, unknown>): this {
      this.operation = 'update';
      this.payload = value;
      return this;
    }

    delete(): this {
      this.operation = 'delete';
      return this;
    }

    single() {
      if (
        this.table === 'artistas' &&
        this.operation === 'insert' &&
        dbInsertThrows
      ) {
        return Promise.reject(new Error('network timeout'));
      }
      if (
        this.table === 'artistas' &&
        this.operation === 'insert' &&
        dbInsertFailure
      ) {
        return Promise.resolve({
          data: null,
          error: { message: 'db unavailable' },
        });
      }
      return Promise.resolve({
        data: {
          id: this.operation === 'insert' ? 99 : this.recordId,
          ...this.payload,
        },
        error: null,
      });
    }

    then(resolve: (value: { data: { id: number }[]; error: null }) => unknown) {
      const data = this.emailFilter && existingArtistEmail ? [{ id: 7 }] : [];
      return Promise.resolve({ data, error: null }).then(resolve);
    }
  }

  const fakeAuthClient = {
    auth: {
      getUser: (token: string) => {
        if (token === 'admin-token') {
          return Promise.resolve({
            data: { user: { id: 'admin-id', app_metadata: { role: 'admin' } } },
            error: null,
          });
        }
        if (token === 'artist-token') {
          return Promise.resolve({
            data: {
              user: { id: 'artist-id', app_metadata: { role: 'artist' } },
            },
            error: null,
          });
        }
        if (token === 'user-metadata-admin-token') {
          return Promise.resolve({
            data: {
              user: {
                id: 'common-id',
                app_metadata: {},
                user_metadata: { role: 'admin' },
              },
            },
            error: null,
          });
        }
        return Promise.resolve({
          data: { user: null },
          error: { message: 'invalid token' },
        });
      },
    },
  };
  const fakeDatabaseClient = {
    key: 'SERVICE_ROLE_TEST_SENTINEL',
    auth: {
      admin: {
        createUser: (options: Record<string, unknown>) => {
          createdUserOptions.push(options);
          if (authMode === 'duplicate')
            return Promise.resolve({
              data: { user: null },
              error: { code: 'user_already_exists' },
            });
          if (authMode === 'failure')
            return Promise.resolve({
              data: { user: null },
              error: { code: 'unexpected_failure' },
            });
          createdUsers.push('new-user-id');
          return Promise.resolve({
            data: { user: { id: 'new-user-id' } },
            error: null,
          });
        },
        deleteUser: (id: string) => {
          deletedUsers.push(id);
          return Promise.resolve({
            error: compensationFailure ? { message: 'cleanup failed' } : null,
          });
        },
      },
    },
    from: (table: string) => {
      databaseTables.push(table);
      return new FakeQuery(table);
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SupabaseService)
      .useValue({
        getAuthClient: () => fakeAuthClient,
        getDatabaseClient: () => fakeDatabaseClient,
      })
      .compile();
    app = moduleFixture.createNestApplication();
    configureValidation(app);
    await app.init();
  });

  beforeEach(() => {
    insertedArtist = undefined;
    selectedColumns.length = 0;
    databaseTables.length = 0;
    createdUsers.length = 0;
    createdUserOptions.length = 0;
    deletedUsers.length = 0;
    authMode = 'ok';
    dbInsertFailure = false;
    dbInsertThrows = false;
    existingArtistEmail = false;
    compensationFailure = false;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  function callAdminRoute(
    method: 'get' | 'patch' | 'put' | 'delete',
    path: string,
    token?: string,
  ) {
    const client = request(app.getHttpServer());
    const result =
      method === 'get'
        ? client.get(path)
        : method === 'patch'
          ? client.patch(path)
          : method === 'put'
            ? client.put(path)
            : client.delete(path);
    if (token) result.set('Authorization', `Bearer ${token}`);
    if (method === 'patch') result.send({ status: 'Aprovado' });
    if (method === 'put') result.send({ nome: 'Novo nome' });
    return result;
  }

  const adminRoutes = [
    ['get', '/artistas'],
    ['patch', '/artistas/1/status'],
    ['put', '/artistas/1'],
    ['delete', '/artistas/1'],
    ['get', '/feedbacks'],
    ['delete', '/feedbacks/1'],
  ] as const;

  const validArtist = {
    nome: 'Novo artista',
    email: 'novo@example.com',
    contato: '(53) 99999-0000',
    area_atuacao: 'Música',
    senha: 'senha123',
  };

  it.each(adminRoutes)('%s %s sem token retorna 401', async (method, path) => {
    await callAdminRoute(method, path).expect(401);
  });

  it.each(adminRoutes)(
    '%s %s com usuário comum retorna 403',
    async (method, path) => {
      await callAdminRoute(method, path, 'artist-token').expect(403);
    },
  );

  it('rejeita token inválido com 401', async () => {
    await callAdminRoute('get', '/artistas', 'invalid-token').expect(401);
  });

  it('não aceita papel admin vindo de user_metadata', async () => {
    await callAdminRoute(
      'get',
      '/artistas',
      'user-metadata-admin-token',
    ).expect(403);
  });

  it.each(adminRoutes)('%s %s permite admin', async (method, path) => {
    await callAdminRoute(method, path, 'admin-token').expect(200);
  });

  it('permite ao admin consultar e alterar registros', async () => {
    const artists = await callAdminRoute(
      'get',
      '/artistas',
      'admin-token',
    ).expect(200);
    expect(artists.body).toHaveLength(2);
    const status = await callAdminRoute(
      'patch',
      '/artistas/1/status',
      'admin-token',
    ).expect(200);
    expect(status.body).toMatchObject({ id: 1, status: 'Aprovado' });
    await callAdminRoute('get', '/feedbacks', 'admin-token').expect(200);
  });

  it('expõe somente campos permitidos dos artistas aprovados sem login', async () => {
    const response = await request(app.getHttpServer())
      .get('/artistas/aprovados')
      .expect(200);
    expect(response.body).toHaveLength(1);
    const publicRows = response.body as unknown as Record<string, unknown>[];
    expect(publicRows[0]).toMatchObject({ id: 1, nome: 'Artista aprovado' });
    for (const field of ['cpf_cnpj', 'email', 'status', 'created_at']) {
      expect(publicRows[0]).not.toHaveProperty(field);
    }
    expect(JSON.stringify(response.body)).not.toContain(
      'SERVICE_ROLE_TEST_SENTINEL',
    );
    expect(selectedColumns).toEqual([
      'id,nome,nome_artistico,area_atuacao,bio,foto_url,instagram,site,contato,cidade,tags,disponibilidade',
    ]);
    expect(databaseTables).toEqual(['artistas']);
  });

  it('permite feedback público sem login', async () => {
    const response = await request(app.getHttpServer())
      .post('/feedbacks')
      .send({ mensagem: 'Mensagem de teste', tipo: 'Sugestão', nota: 5 })
      .expect(201);
    expect(response.body).toMatchObject({ mensagem: 'Mensagem de teste' });
    expect(databaseTables).toEqual(['feedbacks']);
  });

  it('permite cadastro público válido com status Pendente e sem senha na ficha', async () => {
    const response = await request(app.getHttpServer())
      .post('/artistas')
      .send(validArtist)
      .expect(201);
    expect(response.body).toEqual({ id: 99, status: 'Pendente' });
    expect(insertedArtist).toMatchObject({
      nome: 'Novo artista',
      contato: '53999990000',
      status: 'Pendente',
    });
    for (const field of [
      'senha',
      'id',
      'forceStatus',
      'created_at',
      'app_metadata',
    ]) {
      expect(insertedArtist).not.toHaveProperty(field);
    }
    expect(createdUsers).toEqual(['new-user-id']);
    expect(createdUserOptions[0]).toMatchObject({
      email: validArtist.email,
      email_confirm: false,
    });
    expect(deletedUsers).toEqual([]);
    expect(databaseTables).toEqual(['artistas', 'artistas']);
  });

  it.each([
    [{ nome: '  ' }, 'nome vazio'],
    [{ email: 'inválido' }, 'e-mail inválido'],
    [{ contato: '123' }, 'telefone inválido'],
    [{ cpf_cnpj: '00000000000' }, 'CPF inválido'],
    [{ cpf_cnpj: '00000000000000' }, 'CNPJ inválido'],
    [{ status: 'Aprovado' }, 'status público'],
    [{ id: 42 }, 'id administrativo'],
    [{ forceStatus: true }, 'forceStatus administrativo'],
  ])('rejeita cadastro com %s (%s)', async (change, _description) => {
    expect(_description).toBeTruthy();
    await request(app.getHttpServer())
      .post('/artistas')
      .send({ ...validArtist, ...change })
      .expect(400);
    expect(createdUsers).toEqual([]);
    expect(databaseTables).toEqual([]);
  });

  it('rejeita status arbitrário e aceita os estados atuais', async () => {
    await callAdminRoute('patch', '/artistas/1/status', 'admin-token')
      .send({ status: 'Publicado' })
      .expect(400);
    await callAdminRoute('patch', '/artistas/1/status', 'admin-token')
      .send({ status: 'Rejeitado' })
      .expect(200);
  });

  it.each([
    [{ nota: 0 }, 'nota abaixo'],
    [{ nota: 6 }, 'nota acima'],
    [{ email: 'inválido' }, 'e-mail inválido'],
    [{ mensagem: 'curta' }, 'mensagem curta'],
    [{ tipo: 'Desconhecido' }, 'tipo inválido'],
    [{ status: 'Aprovado' }, 'campo extra'],
  ])('rejeita feedback com %s (%s)', async (change, _description) => {
    expect(_description).toBeTruthy();
    await request(app.getHttpServer())
      .post('/feedbacks')
      .send({
        mensagem: 'Mensagem de teste válida',
        tipo: 'Sugestão',
        nota: 5,
        ...change,
      })
      .expect(400);
    expect(databaseTables).toEqual([]);
  });

  it('rejeita e-mail já presente na tabela antes de criar Auth', async () => {
    existingArtistEmail = true;
    await request(app.getHttpServer())
      .post('/artistas')
      .send(validArtist)
      .expect(409);
    expect(createdUsers).toEqual([]);
    expect(deletedUsers).toEqual([]);
  });

  it('Auth falha: não cria ficha; duplicidade não apaga conta existente', async () => {
    authMode = 'failure';
    await request(app.getHttpServer())
      .post('/artistas')
      .send(validArtist)
      .expect(503);
    expect(databaseTables).toEqual(['artistas']);
    expect(deletedUsers).toEqual([]);
    authMode = 'duplicate';
    await request(app.getHttpServer())
      .post('/artistas')
      .send(validArtist)
      .expect(409);
    expect(databaseTables).toEqual(['artistas', 'artistas']);
    expect(deletedUsers).toEqual([]);
  });

  it('falha de inserção após Auth remove apenas conta recém-criada', async () => {
    dbInsertFailure = true;
    await request(app.getHttpServer())
      .post('/artistas')
      .send(validArtist)
      .expect(503);
    expect(createdUsers).toEqual(['new-user-id']);
    expect(deletedUsers).toEqual(['new-user-id']);
  });

  it('resposta ambígua do banco exige revisão sem apagar a conta às cegas', async () => {
    dbInsertThrows = true;
    const response = await request(app.getHttpServer())
      .post('/artistas')
      .send(validArtist)
      .expect(503);
    expect((response.body as { message: string }).message).toMatch(/suporte/i);
    expect(deletedUsers).toEqual([]);
  });

  it('normaliza CPF/CNPJ válidos antes da persistência', async () => {
    await request(app.getHttpServer())
      .post('/artistas')
      .send({
        ...validArtist,
        cpf_cnpj: '529.982.247-25 / 04.252.011/0001-10',
      })
      .expect(201);
    expect(insertedArtist?.cpf_cnpj).toBe('52998224725 / 04252011000110');
  });

  it('aceita CNPJ alfanumérico vigente e persiste formato normalizado', async () => {
    await request(app.getHttpServer())
      .post('/artistas')
      .send({ ...validArtist, cpf_cnpj: '12.abc.345/01de-35' })
      .expect(201);
    expect(insertedArtist?.cpf_cnpj).toBe('12ABC34501DE35');
  });

  it('falha de compensação é explícita e não expõe stack ou senha', async () => {
    dbInsertFailure = true;
    compensationFailure = true;
    const response = await request(app.getHttpServer())
      .post('/artistas')
      .send(validArtist)
      .expect(503);
    const body = response.body as { message: string };
    expect(body.message).toMatch(/suporte/i);
    expect(JSON.stringify(response.body)).not.toContain(validArtist.senha);
    expect(deletedUsers).toEqual(['new-user-id']);
  });
});
