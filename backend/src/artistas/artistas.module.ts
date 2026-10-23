import { Module } from '@nestjs/common';
import { ArtistasService } from './artistas.service';
import { ArtistasController } from './artistas.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { ArtistProfileService } from './profile/artist-profile.service';
import {
  ArtistProfileController,
  ProfileWriteLimit,
} from './profile/artist-profile.controller';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [ArtistasController, ArtistProfileController],
  providers: [ArtistasService, ArtistProfileService, ProfileWriteLimit],
})
export class ArtistasModule {}
