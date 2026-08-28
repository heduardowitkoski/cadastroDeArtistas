import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArtistasModule } from './artistas/artistas.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ArtistasModule,
    FeedbackModule,
  ],
})
export class AppModule {}
