import { applyDecorators, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { AdminGuard } from './admin.guard';

export function AdminOnly(): MethodDecorator {
  return applyDecorators(UseGuards(SupabaseAuthGuard, AdminGuard));
}
