import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { SupabaseService } from '../../supabase/supabase.service';
import {
  PUBLIC_ARTISTA_COLUMNS,
  PublicArtista,
  toPublicArtista,
} from '../public-artista';
import { ArtistEventDto } from './event.dto';
import { MEDIA_BUCKET, PreparedMedia, MediaKind } from './media-validation';

type Result<T> = { data: T; error: unknown };
export type MediaRow = {
  id: string;
  artist_id: number;
  kind: MediaKind;
  object_path: string;
  thumbnail_path: string | null;
  name: string;
  mime: string;
  size: number;
  width?: number | null;
  height?: number | null;
};
type EventRow = ArtistEventDto & { id: string; artist_id: number };
const MEDIA_COLUMNS =
  'id,artist_id,kind,object_path,thumbnail_path,name,mime,size,width,height';
function data<T>(value: unknown): T {
  const r = value as Result<T>;
  if (r.error)
    throw new ServiceUnavailableException(
      'Não foi possível acessar os dados do perfil.',
    );
  return r.data;
}
const safePath = (path: string) =>
  /^artistas\/[1-9]\d*\/[a-f0-9-]{36}(?:-thumb)?\.(?:webp|pdf)$/.test(path);

@Injectable()
export class ArtistProfileService {
  private readonly logger = new Logger(ArtistProfileService.name);
  constructor(private readonly supabase: SupabaseService) {}
  private get db() {
    return this.supabase.getDatabaseClient();
  }
  async artist(id: number, publicOnly = false) {
    let query = this.db
      .from('artistas')
      .select(`${PUBLIC_ARTISTA_COLUMNS},created_at`)
      .eq('id', id);
    if (publicOnly) query = query.eq('status', 'Aprovado');
    const rows = data<(PublicArtista & { created_at?: string })[]>(
      await query.limit(1),
    );
    if (!rows?.[0]) throw new NotFoundException('Artista não encontrado.');
    return rows[0];
  }
  async media(id: number) {
    return data<MediaRow[]>(
      await this.db
        .from('artist_media')
        .select(MEDIA_COLUMNS)
        .eq('artist_id', id)
        .order('created_at', { ascending: true }),
    );
  }
  private mediaDto(row: MediaRow) {
    return {
      id: row.id,
      kind: row.kind,
      name: row.name,
      mime: row.mime,
      size: row.size,
      width: row.width,
      height: row.height,
      url: `/artistas/${row.artist_id}/arquivos/${row.id}`,
      thumbnail_url: row.thumbnail_path
        ? `/artistas/${row.artist_id}/arquivos/${row.id}?thumbnail=1`
        : null,
    };
  }
  async profile(id: number) {
    const row = await this.artist(id, true);
    const [media, events, stats] = await Promise.all([
      this.media(id),
      this.events(id, true),
      this.db
        .from('artist_profile_stats')
        .select('views')
        .eq('artist_id', id)
        .limit(1),
    ]);
    const views = data<{ views: number }[]>(stats)?.[0]?.views || 0;
    const photo = media.find((m) => m.kind === 'photo');
    const day = row.created_at?.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || null;
    return {
      ...toPublicArtista(row),
      foto_url: photo ? this.mediaDto(photo).url : row.foto_url,
      member_since: day,
      views: Number(views),
      media: media.map((m) => this.mediaDto(m)),
      events,
    };
  }
  async adminMedia(id: number) {
    await this.artist(id);
    return (await this.media(id)).map((m) => this.mediaDto(m));
  }
  async readFile(
    id: number,
    mediaId: string,
    thumbnail = false,
    admin = false,
  ) {
    await this.artist(id, !admin);
    const row = (await this.media(id)).find((m) => m.id === mediaId);
    if (!row) throw new NotFoundException('Arquivo não encontrado.');
    const path =
      thumbnail && row.thumbnail_path ? row.thumbnail_path : row.object_path;
    if (!safePath(path) || !path.startsWith(`artistas/${id}/`))
      throw new NotFoundException('Arquivo não encontrado.');
    const blob = data<Blob>(
      await this.db.storage.from(MEDIA_BUCKET).download(path),
    );
    return {
      buffer: Buffer.from(await blob.arrayBuffer()),
      mime: row.mime,
      name: row.name,
    };
  }
  async queue(paths: string[]) {
    if (!paths.length) return null;
    if (paths.some((p) => !safePath(p)))
      throw new BadRequestException('Identificador de mídia inválido.');
    const id = randomUUID();
    data(await this.db.from('artist_media_cleanup').insert([{ id, paths }]));
    return id;
  }
  // Fila nasce ANTES do upload/delete. Referências atuais impedem apagar um objeto
  // cujo commit ocorreu, mesmo se a resposta da inserção/deleção se perdeu.
  async cleanup(jobId: string) {
    try {
      const job = data<{ id: string; paths: string[] }[]>(
        await this.db
          .from('artist_media_cleanup')
          .select('id,paths')
          .eq('id', jobId)
          .limit(1),
      )?.[0];
      if (!job) return true;
      if (job.paths.some((p) => !safePath(p))) return false;
      const originals = data<MediaRow[]>(
        await this.db
          .from('artist_media')
          .select('object_path,thumbnail_path')
          .in('object_path', job.paths),
      );
      const thumbs = data<MediaRow[]>(
        await this.db
          .from('artist_media')
          .select('object_path,thumbnail_path')
          .in('thumbnail_path', job.paths),
      );
      const referenced = new Set(
        [...originals, ...thumbs].flatMap((m) => [
          m.object_path,
          m.thumbnail_path,
        ]),
      );
      const removable = job.paths.filter((p) => !referenced.has(p));
      if (removable.length)
        data(await this.db.storage.from(MEDIA_BUCKET).remove(removable));
      data(await this.db.from('artist_media_cleanup').delete().eq('id', jobId));
      return true;
    } catch {
      this.logger.warn(
        'Limpeza de mídia pendente; executar rotina administrativa de recuperação.',
      );
      return false;
    }
  }
  async cleanupPending() {
    // Janela protege uploads em andamento; limitado a100 jobs por execução.
    const jobs = data<{ id: string }[]>(
      await this.db
        .from('artist_media_cleanup')
        .select('id')
        .lt('created_at', new Date(Date.now() - 30 * 60_000).toISOString())
        .limit(100),
    );
    let completed = 0;
    for (const job of jobs) if (await this.cleanup(job.id)) completed++;
    // Só hashes, não IDs de navegador/IP; retenção máxima30 dias (dedup após esse prazo reinicia).
    data(
      await this.db
        .from('artist_view_sessions')
        .delete()
        .lt('created_at', new Date(Date.now() - 30 * 86400_000).toISOString()),
    );
    return { processed: jobs.length, completed };
  }
  async store(id: number, prepared: PreparedMedia[]) {
    await this.artist(id);
    if (!prepared.length) return [];
    const existing = await this.media(id);
    for (const kind of ['photo', 'gallery', 'portfolio']) {
      if (
        [...existing, ...prepared].filter((row) => row.kind === kind).length >
        (kind === 'gallery' ? 8 : 1)
      ) {
        throw new BadRequestException(
          'O artista pode ter uma foto, até 8 imagens de galeria e um PDF. Remova o material anterior antes de substituir.',
        );
      }
    }
    const rows = prepared.map((p) => ({
      id: p.id,
      artist_id: id,
      kind: p.kind,
      object_path: `artistas/${id}/${p.id}.${p.kind === 'portfolio' ? 'pdf' : 'webp'}`,
      thumbnail_path: p.thumbnail ? `artistas/${id}/${p.id}-thumb.webp` : null,
      name: p.name,
      mime: p.mime,
      size: p.buffer.length,
      width: p.width || null,
      height: p.height || null,
    }));
    const job = await this.queue(
      rows.flatMap((r) => [
        r.object_path,
        ...(r.thumbnail_path ? [r.thumbnail_path] : []),
      ]),
    );
    try {
      for (let i = 0; i < prepared.length; i++) {
        const p = prepared[i],
          r = rows[i];
        data(
          await this.db.storage
            .from(MEDIA_BUCKET)
            .upload(r.object_path, p.buffer, {
              contentType: p.mime,
              upsert: false,
            }),
        );
        if (p.thumbnail && r.thumbnail_path)
          data(
            await this.db.storage
              .from(MEDIA_BUCKET)
              .upload(r.thumbnail_path, p.thumbnail, {
                contentType: 'image/webp',
                upsert: false,
              }),
          );
      }
      data(
        await this.db.rpc('attach_artist_media', {
          p_artist_id: id,
          p_rows: rows,
        }),
      );
      if (job) await this.cleanup(job); // Referenciados não são apagados; só retira o job.
      return rows.map((r) => this.mediaDto(r));
    } catch {
      if (job) await this.cleanup(job);
      throw new ServiceUnavailableException(
        'Não foi possível salvar as mídias. Confira os limites e a configuração de Storage.',
      );
    }
  }
  async prepareArtistDeletion(id: number) {
    const rows = await this.media(id);
    return this.queue(
      rows.flatMap((r) => [
        r.object_path,
        ...(r.thumbnail_path ? [r.thumbnail_path] : []),
      ]),
    );
  }
  async removeMedia(id: number, mediaId: string) {
    await this.artist(id);
    const row = (await this.media(id)).find((m) => m.id === mediaId);
    if (!row) throw new NotFoundException('Arquivo não encontrado.');
    const job = await this.queue([
      row.object_path,
      ...(row.thumbnail_path ? [row.thumbnail_path] : []),
    ]);
    data(
      await this.db.rpc('delete_artist_media', {
        p_artist_id: id,
        p_media_id: mediaId,
      }),
    );
    return {
      removed: true,
      cleanup_pending: job ? !(await this.cleanup(job)) : false,
    };
  }
  async events(id: number, publicOnly = false) {
    let query = this.db
      .from('artist_events')
      .select('id,titulo,descricao,starts_at,local,cidade,link,is_public')
      .eq('artist_id', id);
    if (publicOnly)
      query = query
        .eq('is_public', true)
        .gte('starts_at', new Date().toISOString());
    const rows = data<EventRow[]>(
      await query.limit(100).order('starts_at', { ascending: true }),
    );
    return rows.map((r) => ({
      id: r.id,
      titulo: r.titulo,
      descricao: r.descricao,
      starts_at: r.starts_at,
      local: r.local,
      cidade: r.cidade,
      link: r.link,
      ...(!publicOnly ? { is_public: r.is_public } : {}),
    }));
  }
  async adminEvents(id: number) {
    await this.artist(id);
    return this.events(id);
  }
  async saveEvent(id: number, dto: ArtistEventDto, eventId?: string) {
    await this.artist(id);
    if (!/(Z|[+-]\d{2}:\d{2})$/.test(dto.starts_at))
      throw new BadRequestException('Informe data/hora com fuso horário.');
    const payload = { ...dto, artist_id: id };
    const query = eventId
      ? this.db
          .from('artist_events')
          .update(payload)
          .eq('artist_id', id)
          .eq('id', eventId)
      : this.db
          .from('artist_events')
          .insert([{ ...payload, id: randomUUID() }]);
    const rows = data<EventRow[]>(await query.select('id'));
    if (!rows?.length) throw new NotFoundException('Evento não encontrado.');
    return { id: rows[0].id };
  }
  async removeEvent(id: number, eventId: string) {
    await this.artist(id);
    const rows = data<EventRow[]>(
      await this.db
        .from('artist_events')
        .delete()
        .eq('artist_id', id)
        .eq('id', eventId)
        .select('id'),
    );
    if (!rows?.length) throw new NotFoundException('Evento não encontrado.');
    return { removed: true };
  }
  async recordView(id: number, sessionId: string) {
    if (
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
        sessionId,
      )
    )
      throw new BadRequestException('Sessão de visita inválida.');
    const hash = createHash('sha256')
      .update(`${id}:${sessionId}`)
      .digest('hex');
    const views = data<number | null>(
      await this.db.rpc('record_artist_view', {
        p_artist_id: id,
        p_session_hash: hash,
      }),
    );
    if (views === null) throw new NotFoundException('Artista não encontrado.');
    return { views: Number(views) };
  }
}
