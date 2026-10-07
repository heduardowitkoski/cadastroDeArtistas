import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from './authenticated-request';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.authenticatedUser) {
      throw new UnauthorizedException('Sessão obrigatória');
    }
    if (request.authenticatedUser.app_metadata?.role !== 'admin') {
      throw new ForbiddenException('Acesso administrativo necessário');
    }
    return true;
  }
}
