import { Module } from '@nestjs/common';
import { ArtistasService } from './artistas.service';
import { ArtistasController } from './artistas.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [ArtistasController],
  providers: [ArtistasService],
})
export class ArtistasModule {}
