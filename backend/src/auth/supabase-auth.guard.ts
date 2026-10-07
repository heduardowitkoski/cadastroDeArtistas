import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type { AuthenticatedRequest } from './authenticated-request';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const token = /^Bearer ([^\s]+)$/i.exec(authorization ?? '')?.[1];
    if (!token) {
      throw new UnauthorizedException('Token Bearer obrigatório');
    }

    try {
      const { data, error } = await this.supabaseService
        .getAuthClient()
        .auth.getUser(token);
      if (error || !data.user) {
        throw new UnauthorizedException('Sessão inválida');
      }
      request.authenticatedUser = data.user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new ServiceUnavailableException(
        'Não foi possível validar a sessão',
      );
    }
  }
}
