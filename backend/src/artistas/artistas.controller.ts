import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ArtistasService } from './artistas.service';

@Controller('artistas')
export class ArtistasController {
  constructor(private readonly artistasService: ArtistasService) {}

  @Get()
  findAll() {
    return this.artistasService.findAll();
  }

  @Get('aprovados')
  findAprovados() {
    return this.artistasService.findAprovados();
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.artistasService.create(body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.artistasService.updateStatus(Number(id), body.status);
  }
}
