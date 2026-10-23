import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import sharp from 'sharp';
import { PDFDocument, PDFName } from 'pdf-lib';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';
import { configureValidation } from '../src/validation/configure-validation';
import { qualityFixture } from './support/quality-fixture';
import {
  prepareMedia,
  MAX_FILE_BYTES,
} from '../src/artistas/profile/media-validation';

describe('Perfil público completo — RF03/04/05/07/08/10 e novos CT-PERFIL', () => {
  let app: INestApplication<App>,
    fixture: ReturnType<typeof qualityFixture>,
    image: Buffer,
    pdf: Buffer;
  const auth = { Authorization: 'Bearer admin-token' };
  const event = {
    titulo: 'SMOKE_TEST_Oficina',
    descricao: 'Evento de teste local',
    starts_at: '2099-10-23T19:00:00-03:00',
    local: 'Espaço cultural',
    cidade: 'Bagé',
    link: 'https://example.test/evento',
    is_public: true,
  };
  beforeAll(async () => {
    image = await sharp({
      create: { width: 64, height: 48, channels: 3, background: '#7C3AED' },
    })
      .png()
      .toBuffer();
    const doc = await PDFDocument.create();
    doc.addPage();
    pdf = Buffer.from(await doc.save());
  });
  beforeEach(async () => {
    fixture = qualityFixture(6);
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
  const body = (r: { body: unknown }) => r.body as Record<string, unknown>;
  const upload = (id = 1) =>
    request(app.getHttpServer()).post(`/artistas/${id}/midias`).set(auth);
  it('CT-PERFIL-01 perfil aprovado deriva data, não publica email/documento/status/UID/created_at', async () => {
    const r = await request(app.getHttpServer()).get('/artistas/1').expect(200);
    expect(body(r)).toMatchObject({
      id: 1,
      member_since: '2026-10-23',
      views: 0,
      media: [],
      events: [],
    });
    for (const field of [
      'email',
      'cpf_cnpj',
      'status',
      'created_at',
      'uid',
      'app_metadata',
    ])
      expect(body(r)).not.toHaveProperty(field);
  });
  it.each([2, 3, 999])(
    'CT-PERFIL-02 inexistente/privado %s tem o mesmo404 sem dados',
    async (id) => {
      const r = await request(app.getHttpServer())
        .get(`/artistas/${id}`)
        .expect(404);
      expect(body(r).message).toBe('Artista não encontrado.');
    },
  );
  it('CT-PERFIL-03 sem foto/bio/opcionais não inventa dados', async () => {
    Object.assign(fixture.state.artists[0], {
      foto_url: null,
      bio: null,
      instagram: null,
      site: null,
      disponibilidade: [],
      created_at: undefined,
    });
    const r = await request(app.getHttpServer()).get('/artistas/1').expect(200);
    expect(body(r)).toMatchObject({
      foto_url: null,
      bio: null,
      member_since: null,
      media: [],
      events: [],
    });
  });
  it('CT-PERFIL-04 mantém bio longa integral e foto Base64 antiga', async () => {
    const photo = 'data:image/png;base64,fixture';
    fixture.state.artists[0].bio = 'a'.repeat(2000);
    fixture.state.artists[0].foto_url = photo;
    const r = await request(app.getHttpServer()).get('/artistas/1');
    expect(String(body(r).bio)).toHaveLength(2000);
    expect(body(r).foto_url).toBe(photo);
  });
  it('CT-VISITA-01 primeira visita conta e refresh/sessão repetida não repete', async () => {
    const session_id = randomUUID();
    for (let i = 0; i < 3; i++) {
      const r = await request(app.getHttpServer())
        .post('/artistas/1/visualizacoes')
        .send({ session_id })
        .expect(201);
      expect(body(r).views).toBe(1);
    }
    expect(fixture.state.viewSessions.size).toBe(1);
  });
  it('CT-VISITA-02 distingue artistas/sessões e concorrência básica', async () => {
    const session_id = randomUUID();
    await Promise.all(
      Array.from({ length: 12 }, () =>
        request(app.getHttpServer())
          .post('/artistas/1/visualizacoes')
          .send({ session_id })
          .expect(201),
      ),
    );
    await request(app.getHttpServer())
      .post('/artistas/4/visualizacoes')
      .send({ session_id })
      .expect(201);
    const r = await request(app.getHttpServer())
      .post('/artistas/1/visualizacoes')
      .send({ session_id: randomUUID() })
      .expect(201);
    expect(body(r).views).toBe(2);
    expect(fixture.state.stats.find((s) => s.artist_id === 4)?.views).toBe(1);
  });
  it.each([
    {},
    { session_id: 'invalid' },
    { session_id: randomUUID(), views: 999 },
  ])('CT-VISITA-03 requisição inválida bloqueada', async (payload) => {
    await request(app.getHttpServer())
      .post('/artistas/1/visualizacoes')
      .send(payload)
      .expect(400);
    expect(fixture.state.stats).toHaveLength(0);
  });
  it('CT-VISITA-04 privado não conta', async () => {
    await request(app.getHttpServer())
      .post('/artistas/2/visualizacoes')
      .send({ session_id: randomUUID() })
      .expect(404);
    expect(fixture.state.stats).toHaveLength(0);
  });
  it('CT-MIDIA-01 PDF e imagens reais persistem, sem path/artist_id na resposta pública', async () => {
    const r = await upload()
      .attach('portfolio', pdf, {
        filename: 'catalogo.pdf',
        contentType: 'application/pdf',
      })
      .attach('photo', image, {
        filename: 'foto.png',
        contentType: 'image/png',
      })
      .attach('gallery', image, {
        filename: 'trabalho.png',
        contentType: 'image/png',
      })
      .expect(201);
    expect(r.body).toHaveLength(3);
    expect(fixture.state.objects.size).toBe(5);
    for (const m of fixture.state.media) {
      expect(String(m.object_path)).toMatch(
        /^artistas\/1\/[a-f0-9-]{36}\.(webp|pdf)$/,
      );
      expect(String(m.object_path)).not.toMatch(
        /catalogo|foto|trabalho|email|cpf/,
      );
    }
    const profile = await request(app.getHttpServer())
      .get('/artistas/1')
      .expect(200);
    for (const m of body(profile).media as Record<string, unknown>[]) {
      expect(m).not.toHaveProperty('object_path');
      expect(m).not.toHaveProperty('artist_id');
    }
    const id = fixture.state.media.find((m) => m.kind === 'portfolio')!.id;
    const file = await request(app.getHttpServer())
      .get(`/artistas/1/arquivos/${String(id)}?download=1`)
      .expect(200);
    expect(file.headers['content-disposition']).toContain('attachment');
    expect(file.headers['content-security-policy']).toContain('sandbox');
    expect(file.headers['cache-control']).toBe('no-store');
  });
  it('CT-MIDIA-02 privados só admin; desaprovar revoga arquivo sem apagar Storage/agenda', async () => {
    await upload(2)
      .attach('portfolio', pdf, {
        filename: 'portfolio.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);
    const id = String(fixture.state.media[0].id);
    await request(app.getHttpServer())
      .get(`/artistas/2/arquivos/${id}`)
      .expect(404);
    await request(app.getHttpServer())
      .get(`/artistas/2/midias/${id}/conteudo`)
      .set(auth)
      .expect(200);
    await request(app.getHttpServer())
      .patch('/artistas/2/status')
      .set(auth)
      .send({ status: 'Aprovado' })
      .expect(200);
    await request(app.getHttpServer())
      .get(`/artistas/2/arquivos/${id}`)
      .expect(200);
    await request(app.getHttpServer())
      .patch('/artistas/2/status')
      .set(auth)
      .send({ status: 'Rejeitado' })
      .expect(200);
    await request(app.getHttpServer())
      .get(`/artistas/2/arquivos/${id}`)
      .expect(404);
    expect(fixture.state.objects.size).toBe(1);
  });
  it.each([
    ['fake.pdf', 'application/pdf', Buffer.from('not pdf')],
    ['bad.svg', 'image/svg+xml', Buffer.from('<svg/>')],
    ['wrong.jpg', 'image/jpeg', Buffer.from('not jpeg')],
    ['empty.pdf', 'application/pdf', Buffer.alloc(0)],
    ['real.docx', 'application/pdf', Buffer.from('%PDF-invalid')],
  ])(
    'CT-MIDIA-03 tipo/extensão/vazio inválido %s bloqueado',
    async (name, mime, buffer) => {
      await upload()
        .attach('portfolio', buffer, { filename: name, contentType: mime })
        .expect(400);
      expect(fixture.state.objects.size).toBe(0);
    },
  );
  it('CT-MIDIA-04 MIME declarado JPEG com bytes PNG rejeitado', async () => {
    await upload()
      .attach('gallery', image, {
        filename: 'image.jpg',
        contentType: 'image/jpeg',
      })
      .expect(400);
  });
  it('CT-MIDIA-05 limite exato10MB aceito; acima rejeitado antes de persistir', async () => {
    const exact = Buffer.concat([
      pdf,
      Buffer.alloc(MAX_FILE_BYTES - pdf.length, 32),
    ]);
    await upload()
      .attach('portfolio', exact, {
        filename: 'limite.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);
    await upload(4)
      .attach('portfolio', Buffer.concat([exact, Buffer.from(' ')]), {
        filename: 'grande.pdf',
        contentType: 'application/pdf',
      })
      .expect(413);
    expect(fixture.state.media).toHaveLength(1);
  }, 30000);
  it('CT-MIDIA-06 PDF com ação ativa rejeitado', async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    doc.catalog.set(
      PDFName.of('OpenAction'),
      doc.context.obj({ S: 'JavaScript', JS: 'fixture' }),
    );
    await upload()
      .attach('portfolio', Buffer.from(await doc.save()), {
        filename: 'active.pdf',
        contentType: 'application/pdf',
      })
      .expect(400);
  });
  it('CT-MIDIA-07 quantidade e substituição explícita protegem registros existentes', async () => {
    await upload()
      .attach('photo', image, { filename: 'um.png', contentType: 'image/png' })
      .expect(201);
    await upload()
      .attach('photo', image, {
        filename: 'dois.png',
        contentType: 'image/png',
      })
      .expect(400);
    expect(fixture.state.media).toHaveLength(1);
    expect(fixture.state.objects.size).toBe(2);
  });
  it('CT-MIDIA-08 falha upload não deixa metadado nem órfão sem fila', async () => {
    fixture.state.storageFailure = true;
    await upload()
      .attach('portfolio', pdf, {
        filename: 'f.pdf',
        contentType: 'application/pdf',
      })
      .expect(503);
    expect(fixture.state.media).toHaveLength(0);
    expect(fixture.state.objects.size).toBe(0);
  });
  it('CT-MIDIA-09 excluir artista limpa só seus arquivos e eventos', async () => {
    for (const id of [1, 4]) {
      await upload(id)
        .attach('portfolio', pdf, {
          filename: 'f.pdf',
          contentType: 'application/pdf',
        })
        .expect(201);
      await request(app.getHttpServer())
        .post(`/artistas/${id}/eventos`)
        .set(auth)
        .send(event)
        .expect(201);
    }
    await request(app.getHttpServer())
      .delete('/artistas/1')
      .set(auth)
      .expect(200);
    expect(fixture.state.objects.size).toBe(1);
    expect([...fixture.state.objects.keys()][0]).toMatch(/^artistas\/4\//);
    expect(fixture.state.events).toHaveLength(1);
  });
  it('CT-MIDIA-10 falha limpeza retém fila e recuperação não apaga referência de outro artista', async () => {
    await upload().attach('portfolio', pdf, {
      filename: 'f.pdf',
      contentType: 'application/pdf',
    });
    fixture.state.removeFailure = true;
    const r = await request(app.getHttpServer())
      .delete('/artistas/1')
      .set(auth)
      .expect(200);
    expect(body(r).cleanup_pending).toBe(true);
    expect(fixture.state.cleanupJobs).toHaveLength(1);
    fixture.state.removeFailure = false;
    fixture.state.cleanupJobs[0].created_at = '2020-01-01T00:00:00Z';
    await request(app.getHttpServer())
      .post('/artistas/manutencao/limpeza-midias')
      .set(auth)
      .expect(201);
    expect(fixture.state.objects.size).toBe(0);
    expect(fixture.state.cleanupJobs).toHaveLength(0);
  });
  it('CT-MIDIA-11 id/path de outro artista não permite leitura nem remoção', async () => {
    await upload(4).attach('portfolio', pdf, {
      filename: 'f.pdf',
      contentType: 'application/pdf',
    });
    const id = String(fixture.state.media[0].id);
    await request(app.getHttpServer())
      .get(`/artistas/1/arquivos/${id}`)
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/artistas/1/midias/${id}`)
      .set(auth)
      .expect(404);
    await request(app.getHttpServer())
      .get('/artistas/1/arquivos/..%2F..%2Fsecret')
      .expect(400);
    expect(fixture.state.objects.size).toBe(1);
  });
  it('CT-CAD-MIDIA-01 multipart cria fichaPendente/Auth e mídia privada real', async () => {
    const dados = {
      nome: 'SMOKE_TEST_Cadastro',
      email: 'new@example.test',
      contato: '53999990000',
      area_atuacao: 'Música',
      bio: 'Biografia sintética de teste válida.',
      senha: 'fixture-password',
    };
    const r = await request(app.getHttpServer())
      .post('/artistas/com-midias')
      .field('dados', JSON.stringify(dados))
      .attach('portfolio', pdf, {
        filename: 'f.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);
    expect(body(r)).toMatchObject({
      status: 'Pendente',
      media_upload: 'saved',
    });
    expect(fixture.state.media).toHaveLength(1);
    expect(fixture.state.users.size).toBe(1);
    await request(app.getHttpServer())
      .get(`/artistas/${String(body(r).id)}`)
      .expect(404);
  });
  it('CT-CAD-MIDIA-02 falha de arquivo é pré-validada; falha Storage após ficha é explícita sem duplicar conta', async () => {
    const dados = {
      nome: 'SMOKE_TEST_Cadastro',
      email: 'new@example.test',
      contato: '53999990000',
      area_atuacao: 'Música',
      bio: 'Biografia sintética de teste válida.',
      senha: 'fixture-password',
    };
    await request(app.getHttpServer())
      .post('/artistas/com-midias')
      .field('dados', JSON.stringify(dados))
      .attach('portfolio', Buffer.from('invalid'), {
        filename: 'f.pdf',
        contentType: 'application/pdf',
      })
      .expect(400);
    expect(fixture.state.users.size).toBe(0);
    fixture.state.storageFailure = true;
    const r = await request(app.getHttpServer())
      .post('/artistas/com-midias')
      .field('dados', JSON.stringify(dados))
      .attach('portfolio', pdf, {
        filename: 'f.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);
    expect(body(r).media_upload).toBe('pending');
    expect(fixture.state.users.size).toBe(1);
  });
  it('CT-AGENDA-01 admin cria/edita/remove; público só futuros/públicos e ordenados', async () => {
    for (const change of [
      { titulo: 'Futuro B' },
      { titulo: 'Passado', starts_at: '2020-01-01T12:00:00Z' },
      { titulo: 'Privado', is_public: false },
      { titulo: 'Futuro A', starts_at: '2098-01-01T12:00:00Z' },
    ])
      await request(app.getHttpServer())
        .post('/artistas/1/eventos')
        .set(auth)
        .send({ ...event, ...change })
        .expect(201);
    let r = await request(app.getHttpServer()).get('/artistas/1');
    expect(
      (body(r).events as { titulo: string }[]).map((e) => e.titulo),
    ).toEqual(['Futuro A', 'Futuro B']);
    const id = String(fixture.state.events[0].id);
    await request(app.getHttpServer())
      .put(`/artistas/1/eventos/${id}`)
      .set(auth)
      .send({ ...event, titulo: 'Editado' })
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/artistas/1/eventos/${id}`)
      .set(auth)
      .expect(200);
    r = await request(app.getHttpServer()).get('/artistas/1');
    expect(body(r).events).toHaveLength(1);
  });
  it('CT-AGENDA-02 cadastro privado não publica eventos', async () => {
    await request(app.getHttpServer())
      .post('/artistas/2/eventos')
      .set(auth)
      .send(event)
      .expect(201);
    await request(app.getHttpServer()).get('/artistas/2').expect(404);
  });
  it.each([
    { starts_at: 'bad' },
    { starts_at: '2099-01-01T18:00:00' },
    { titulo: '' },
    { link: 'javascript:alert(1)' },
    { artist_id: 4 },
  ])('CT-AGENDA-03 entrada inválida não persiste', async (change) => {
    await request(app.getHttpServer())
      .post('/artistas/1/eventos')
      .set(auth)
      .send({ ...event, ...change })
      .expect(400);
    expect(fixture.state.events).toHaveLength(0);
  });
  it.each([
    ['', 401],
    ['common-token', 403],
  ])(
    'CT-AUTH-PERFIL-01 mídia/agenda/manutenção protegidas para %s',
    async (token, status) => {
      const itemId = '00000000-0000-4000-8000-000000000001';
      const routes = [
        ['get', '/artistas/1/midias'],
        ['post', '/artistas/1/midias'],
        ['delete', `/artistas/1/midias/${itemId}`],
        ['get', `/artistas/1/midias/${itemId}/conteudo`],
        ['get', '/artistas/1/eventos'],
        ['post', '/artistas/1/eventos'],
        ['put', `/artistas/1/eventos/${itemId}`],
        ['delete', `/artistas/1/eventos/${itemId}`],
        ['post', '/artistas/manutencao/limpeza-midias'],
      ] as const;
      for (const [method, path] of routes) {
        const call = request(app.getHttpServer())[method](path);
        if (token) call.set('Authorization', `Bearer ${token}`);
        await call.expect(Number(status));
      }
    },
  );
  it('CT-MIDIA-12 valida traversal no nome sem incorporá-lo em path', async () => {
    const file = {
      buffer: pdf,
      size: pdf.length,
      originalname: '../../nome-pessoal.pdf',
      mimetype: 'application/pdf',
    } as Express.Multer.File;
    const prepared = await prepareMedia({ portfolio: [file] });
    expect(prepared[0].name).toBe('nome-pessoal.pdf');
    expect(prepared[0].id).toMatch(/^[a-f0-9-]{36}$/);
  });
});
