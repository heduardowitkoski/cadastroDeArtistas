import { Logger, ServiceUnavailableException } from '@nestjs/common';

type DatabaseTable = 'artistas' | 'feedbacks';
type DatabaseOperation = 'select' | 'insert' | 'update' | 'delete';

export function logDatabaseError(
  logger: Logger,
  table: DatabaseTable,
  operation: DatabaseOperation,
  error: { code?: string },
  status?: number,
): void {
  const code =
    typeof error.code === 'string' &&
    /^(?:[0-9A-Z]{5}|PGRST[0-9]{3})$/.test(error.code)
      ? error.code
      : 'unknown';
  const httpStatus =
    typeof status === 'number' &&
    Number.isInteger(status) &&
    status >= 0 &&
    status <= 599
      ? `, status=${status}`
      : '';
  logger.error(
    `Supabase ${table}.${operation} failed (code=${code}${httpStatus})`,
  );
}

export function throwDatabaseError(
  logger: Logger,
  table: DatabaseTable,
  operation: DatabaseOperation,
  error: { code?: string },
  status?: number,
): never {
  logDatabaseError(logger, table, operation, error, status);
  throw new ServiceUnavailableException('Serviço de dados indisponível.');
}
