import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';
import { configureValidation } from '../src/validation/configure-validation';
import { qualityFixture } from './support/quality-fixture';

function rows(response: { body: unknown }) {
  return response.body as Record<string, unknown>[];
}

describe('CT oficiais — fluxos NestJS com persistência simulada em memória', () => {
  let app: INestApplication<App>;
  let fixture: ReturnType<typeof qualityFixture>;
  const payload = {
    nome: 'SMOKE_TEST_Nova artista',
    nome_artistico: 'Arte do Pampa',
    email: 'new@example.test',
    contato: '53999990000',
    area_atuacao: 'Música',
    senha: 'fixture-password',
    bio: 'Biografia sintética válida para testes locais.',
  };
  beforeEach(async () => {
    fixture = qualityFixture();
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(SupabaseService)
      .useValue(fixture.service)
      .compile();
    app = module.createNestApplication();
    configureValidation(app);
    await app.init();
  });
  afterEach(async () => {
    await app.close();
  });
  const auth = { Authorization: 'Bearer admin-token' };

  it('CT-RF01-01/02/03/04 cadastra sem admin, confirma resposta e retém ficha Pendente', async () => {
    const r = await request(app.getHttpServer())
      .post('/artistas')
      .send(payload)
      .expect(201);
    expect(r.body).toMatchObject({
      id: 4,
      status: 'Pendente',
      email_verification: 'requested',
    });
    expect(fixture.state.artists.find((a) => a.id === 4)).toMatchObject({
      nome: payload.nome,
      status: 'Pendente',
    });
    expect(fixture.state.users.has(payload.email)).toBe(true);
    expect(fixture.state.artists.find((a) => a.id === 4)).not.toHaveProperty(
      'senha',
    );
    expect(
      rows(await request(app.getHttpServer()).get('/artistas/aprovados')).map(
        (a) => a.id,
      ),
    ).not.toContain(4);
  });
  it('CT-RF04-01/02/03/05 e CT-RNF02-01/02/07 retorna somente aprovado e allowlist pública', async () => {
    const r = await request(app.getHttpServer())
      .get('/artistas/aprovados')
      .expect(200);
    expect(rows(r).map((a) => a.id)).toEqual([1]);
    for (const row of rows(r))
      for (const key of ['email', 'cpf_cnpj', 'status', 'senha', 'created_at'])
        expect(row).not.toHaveProperty(key);
  });
  it('CT-RF08-01/02/03/04 e CT-RF04-06 aprovação persiste e torna artista consultável', async () => {
    await request(app.getHttpServer())
      .patch('/artistas/2/status')
      .set(auth)
      .send({ status: 'Aprovado' })
      .expect(200);
    const r = await request(app.getHttpServer())
      .get('/artistas/aprovados')
      .expect(200);
    expect(rows(r).map((a) => a.id)).toEqual([1, 2]);
    expect(fixture.state.artists[1].status).toBe('Aprovado');
  });
  it('CT-RF04-04 e CT-RF10-04/05 desaprovação retira do público e mantém registro', async () => {
    await request(app.getHttpServer())
      .patch('/artistas/1/status')
      .set(auth)
      .send({ status: 'Rejeitado' })
      .expect(200);
    expect(
      (await request(app.getHttpServer()).get('/artistas/aprovados')).body,
    ).toEqual([]);
    expect(fixture.state.artists).toHaveLength(3);
    expect(fixture.state.artists[0].status).toBe('Rejeitado');
  });
  it('CT-RF09-01 edição administrativa persiste nome e retorna para Pendente conforme regra vigente', async () => {
    await request(app.getHttpServer())
      .put('/artistas/1')
      .set(auth)
      .send({ nome: 'SMOKE_TEST_Nome editado' })
      .expect(200);
    expect(fixture.state.artists[0]).toMatchObject({
      nome: 'SMOKE_TEST_Nome editado',
      status: 'Pendente',
    });
  });
  it('CT-RF09-02 edição administrativa de categoria reflete no catálogo após aprovação', async () => {
    await request(app.getHttpServer())
      .put('/artistas/1')
      .set(auth)
      .send({ area_atuacao: 'Teatro' })
      .expect(200);
    await request(app.getHttpServer())
      .patch('/artistas/1/status')
      .set(auth)
      .send({ status: 'Aprovado' })
      .expect(200);
    expect(
      rows(await request(app.getHttpServer()).get('/artistas/aprovados'))[0]
        .area_atuacao,
    ).toBe('Teatro');
  });
  it('CT-RF10-01/02 exclusão remove da memória e do catálogo', async () => {
    await request(app.getHttpServer())
      .delete('/artistas/1')
      .set(auth)
      .expect(200);
    expect(fixture.state.artists.find((a) => a.id === 1)).toBeUndefined();
    expect(
      (await request(app.getHttpServer()).get('/artistas/aprovados')).body,
    ).toEqual([]);
  });
  it('CT-RF11-01/02/03/05/06/07 feedback identificado/anônimo persiste e só admin consulta/remove', async () => {
    for (const contact of [
      { nome: 'Pessoa de Teste', email: 'person@example.test' },
      {},
    ])
      await request(app.getHttpServer())
        .post('/feedbacks')
        .send({
          ...contact,
          mensagem: 'SMOKE_TEST_Mensagem de teste válida',
          tipo: 'Sugestão',
          nota: 4,
        })
        .expect(201);
    await request(app.getHttpServer()).get('/feedbacks').expect(401);
    await request(app.getHttpServer())
      .get('/feedbacks')
      .set('Authorization', 'Bearer common-token')
      .expect(403);
    expect(
      (await request(app.getHttpServer()).get('/feedbacks').set(auth)).body,
    ).toHaveLength(2);
    const id = Number(fixture.state.feedbacks[0].id);
    await request(app.getHttpServer())
      .delete(`/feedbacks/${id}`)
      .set(auth)
      .expect(200);
    expect(fixture.state.feedbacks).toHaveLength(1);
  });
  it.each([
    ['', 401],
    ['common-token', 403],
    ['admin-token', 200],
  ])(
    'CT-RF08-05/CT-RF07-06 aprovação com papel %s: %i',
    async (token, status) => {
      const call = request(app.getHttpServer()).patch('/artistas/2/status');
      if (token) call.set('Authorization', `Bearer ${token}`);
      await call.send({ status: 'Aprovado' }).expect(Number(status));
      expect(fixture.state.artists[1].status).toBe(
        status === 200 ? 'Aprovado' : 'Pendente',
      );
    },
  );
  it('CT-RF02-10 duplicidade não cria segunda ficha nem envia nova confirmação', async () => {
    await request(app.getHttpServer())
      .post('/artistas')
      .send(payload)
      .expect(201);
    await request(app.getHttpServer())
      .post('/artistas')
      .send(payload)
      .expect(409);
    expect(
      fixture.state.artists.filter((a) => a.email === payload.email),
    ).toHaveLength(1);
    expect(fixture.state.emailRequests).toHaveLength(1);
  });
  it('CT-RF03-01/07 foto Data URL atravessa API, persiste em memória e é exibível após aprovação', async () => {
    const photo =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD3cAAAAASUVORK5CYII=';
    await request(app.getHttpServer())
      .post('/artistas')
      .send({ ...payload, foto_url: photo })
      .expect(201);
    await request(app.getHttpServer())
      .patch('/artistas/4/status')
      .set(auth)
      .send({ status: 'Aprovado' })
      .expect(200);
    const r = await request(app.getHttpServer()).get('/artistas/aprovados');
    expect(rows(r).find((a) => a.id === 4)?.foto_url).toBe(photo);
  });
  it('CT-RF03-08 cadastro sem foto/site/Instagram permanece permitido', async () => {
    await request(app.getHttpServer())
      .post('/artistas')
      .send(payload)
      .expect(201);
    expect(fixture.state.artists[3].foto_url).toBeUndefined();
  });
  it('CT-RF09-06 falha de banco não altera registro e é informada', async () => {
    fixture.state.databaseFailure = true;
    await request(app.getHttpServer())
      .put('/artistas/1')
      .set(auth)
      .send({ nome: 'SMOKE_TEST_Não persistir' })
      .expect(503);
    expect(fixture.state.artists[0].nome).toBe('SMOKE_TEST_Artista 1');
  });
  it('CT-RNF03-01/06 catálogo NestJS com 1000 registros e aprovação mantém consultas abaixo de 5s', async () => {
    fixture.state.artists = qualityFixture(1000).state.artists;
    const durations: number[] = [];
    for (let i = 0; i < 20; i++) {
      const start = performance.now();
      const response = await request(app.getHttpServer())
        .get('/artistas/aprovados')
        .expect(200);
      durations.push(performance.now() - start);
      expect(response.body).toHaveLength(334);
    }
    await request(app.getHttpServer())
      .patch('/artistas/2/status')
      .set(auth)
      .send({ status: 'Aprovado' })
      .expect(200);
    expect(
      (await request(app.getHttpServer()).get('/artistas/aprovados')).body,
    ).toHaveLength(335);
    expect(Math.max(...durations)).toBeLessThan(5000);
    console.info(
      `Perf local Nest/memória: 1000 registros, 20 GETs; máximo ${Math.max(...durations).toFixed(2)}ms. Não mede Supabase/Render.`,
    );
  });
});
