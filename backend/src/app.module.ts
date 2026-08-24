import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArtistasModule } from './artistas/artistas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ArtistasModule,
  ],
})
export class AppModule {}
