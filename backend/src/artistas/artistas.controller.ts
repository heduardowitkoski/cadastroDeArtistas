import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ArtistasService } from './artistas.service';
import { AdminOnly } from '../auth/admin-only.decorator';
import { CreateArtistaDto } from './dto/create-artista.dto';
import { UpdateArtistaDto } from './dto/update-artista.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('artistas')
export class ArtistasController {
  constructor(private readonly artistasService: ArtistasService) {}

  @Get()
  @AdminOnly()
  findAll() {
    return this.artistasService.findAll();
  }

  @Get('aprovados')
  findAprovados() {
    return this.artistasService.findAprovados();
  }

  @Post()
  create(@Body() body: CreateArtistaDto) {
    return this.artistasService.create(body);
  }

  @Patch(':id/status')
  @AdminOnly()
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStatusDto,
  ) {
    return this.artistasService.updateStatus(id, body.status);
  }

  @Put(':id')
  @AdminOnly()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateArtistaDto,
  ) {
    return this.artistasService.update(id, body);
  }

  @Delete(':id')
  @AdminOnly()
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.artistasService.delete(id);
  }
}
