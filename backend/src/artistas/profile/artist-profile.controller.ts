import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Response, Request } from 'express';
import { createHash } from 'crypto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AdminOnly } from '../../auth/admin-only.decorator';
import { ArtistasService } from '../artistas.service';
import { CreateArtistaDto } from '../dto/create-artista.dto';
import { ArtistProfileService } from './artist-profile.service';
import { ArtistEventDto } from './event.dto';
import { MAX_FILE_BYTES, prepareMedia } from './media-validation';
import type { MediaFiles } from './media-validation';

const uploads = FileFieldsInterceptor(
  [
    { name: 'photo', maxCount: 1 },
    { name: 'gallery', maxCount: 8 },
    { name: 'portfolio', maxCount: 1 },
  ],
  {
    limits: {
      fileSize: MAX_FILE_BYTES,
      files: 10,
      fields: 1,
      fieldSize: 6_000_000,
    },
  },
);
@Injectable()
export class ProfileWriteLimit implements CanActivate {
  private activeRegistrations = 0;
  private readonly buckets = new Map<
    string,
    { count: number; until: number }
  >();
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const registration = req.path.endsWith('/com-midias');
    const now = Date.now();
    for (const [key, value] of this.buckets)
      if (value.until < now) this.buckets.delete(key);
    const key = createHash('sha256')
      .update(
        `${registration ? 'signup' : 'view'}:${req.ip || req.socket.remoteAddress || 'unknown'}`,
      )
      .digest('hex');
    const row = this.buckets.get(key) || {
      count: 0,
      until: now + (registration ? 3600_000 : 60_000),
    };
    if (row.count >= (registration ? 6 : 60) || this.buckets.size > 10000)
      throw new HttpException(
        'Muitas solicitações. Tente novamente mais tarde.',
        429,
      );
    if (registration) {
      if (this.activeRegistrations >= 2)
        throw new HttpException(
          'Há uploads em processamento. Tente novamente em instantes.',
          429,
        );
      this.activeRegistrations++;
      let released = false;
      const release = () => {
        if (!released) {
          released = true;
          this.activeRegistrations--;
        }
      };
      req.res?.once('finish', release);
      req.res?.once('close', release);
    }
    row.count++;
    this.buckets.set(key, row);
    return true;
  }
}
@Controller('artistas')
export class ArtistProfileController {
  constructor(
    private readonly profile: ArtistProfileService,
    private readonly artists: ArtistasService,
  ) {}
  @Post('com-midias')
  @UseGuards(ProfileWriteLimit)
  @UseInterceptors(uploads)
  async register(
    @Body() body: Record<string, unknown>,
    @UploadedFiles() files: MediaFiles,
  ) {
    let raw: unknown;
    try {
      raw = JSON.parse(String(body.dados));
    } catch {
      throw new BadRequestException('Dados de cadastro inválidos.');
    }
    if (
      Object.keys(body).some((k) => k !== 'dados') ||
      !raw ||
      Array.isArray(raw) ||
      typeof raw !== 'object'
    )
      throw new BadRequestException('Dados de cadastro inválidos.');
    const dto = plainToInstance(CreateArtistaDto, raw);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false, value: false },
    });
    if (errors.length)
      throw new BadRequestException(
        errors.flatMap((e) => Object.values(e.constraints || {})),
      );
    const prepared = await prepareMedia(files);
    return this.artists.create(dto, prepared);
  }
  @Get(':id') get(@Param('id', ParseIntPipe) id: number) {
    return this.profile.profile(id);
  }
  @Post(':id/visualizacoes')
  @UseGuards(ProfileWriteLimit)
  view(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    if (
      !body ||
      Array.isArray(body) ||
      Object.keys(body).length !== 1 ||
      typeof body.session_id !== 'string'
    )
      throw new BadRequestException('Sessão de visita inválida.');
    return this.profile.recordView(id, body.session_id);
  }
  @Get(':id/arquivos/:mediaId')
  async file(
    @Param('id', ParseIntPipe) id: number,
    @Param('mediaId', new ParseUUIDPipe({ version: '4' })) mediaId: string,
    @Query('thumbnail') thumb: string,
    @Query('download') download: string,
    @Res() res: Response,
  ) {
    return this.send(
      res,
      await this.profile.readFile(id, mediaId, thumb === '1'),
      download === '1',
    );
  }
  @Get(':id/midias')
  @AdminOnly()
  media(@Param('id', ParseIntPipe) id: number) {
    return this.profile.adminMedia(id);
  }
  @Get(':id/midias/:mediaId/conteudo')
  @AdminOnly()
  async adminFile(
    @Param('id', ParseIntPipe) id: number,
    @Param('mediaId', new ParseUUIDPipe({ version: '4' })) mediaId: string,
    @Res() res: Response,
  ) {
    return this.send(
      res,
      await this.profile.readFile(id, mediaId, false, true),
      true,
    );
  }
  @Post(':id/midias')
  @AdminOnly()
  @UseInterceptors(uploads)
  async upload(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: MediaFiles,
    @Body() body: Record<string, unknown>,
  ) {
    const prepared = await prepareMedia(files);
    if (!prepared.length || Object.keys(body).length)
      throw new BadRequestException(
        'Selecione ao menos um arquivo, sem campos adicionais.',
      );
    return this.profile.store(id, prepared);
  }
  @Delete(':id/midias/:mediaId')
  @AdminOnly()
  removeMedia(
    @Param('id', ParseIntPipe) id: number,
    @Param('mediaId', new ParseUUIDPipe({ version: '4' })) mediaId: string,
  ) {
    return this.profile.removeMedia(id, mediaId);
  }
  @Post('manutencao/limpeza-midias')
  @AdminOnly()
  cleanup() {
    return this.profile.cleanupPending();
  }
  @Get(':id/eventos')
  @AdminOnly()
  events(@Param('id', ParseIntPipe) id: number) {
    return this.profile.adminEvents(id);
  }
  @Post(':id/eventos')
  @AdminOnly()
  createEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ArtistEventDto,
  ) {
    return this.profile.saveEvent(id, dto);
  }
  @Put(':id/eventos/:eventId')
  @AdminOnly()
  updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Param('eventId', new ParseUUIDPipe({ version: '4' })) eventId: string,
    @Body() dto: ArtistEventDto,
  ) {
    return this.profile.saveEvent(id, dto, eventId);
  }
  @Delete(':id/eventos/:eventId')
  @AdminOnly()
  removeEvent(
    @Param('id', ParseIntPipe) id: number,
    @Param('eventId', new ParseUUIDPipe({ version: '4' })) eventId: string,
  ) {
    return this.profile.removeEvent(id, eventId);
  }
  private send(
    res: Response,
    file: { buffer: Buffer; mime: string; name: string },
    download: boolean,
  ) {
    const filename =
      file.mime === 'application/pdf' ? 'portfolio.pdf' : 'imagem.webp';
    res.set({
      'Content-Type': file.mime,
      'Content-Length': String(file.buffer.length),
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${filename}"`,
      ...(file.mime === 'application/pdf'
        ? {
            'Content-Security-Policy':
              "sandbox; default-src 'none'; frame-ancestors 'none'",
          }
        : {}),
    });
    return res.send(file.buffer);
  }
}
