import type { TransformFnParams } from 'class-transformer';

export function trimRequired({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export function trimOptional({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed || null;
}

export function normalizeEmail({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export function normalizeOptionalEmail({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') return value;
  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

export function normalizePhone({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^[+\d().\s-]+$/.test(trimmed) ? trimmed.replace(/\D/g, '') : trimmed;
}

export function trimStringArray({ value }: TransformFnParams): unknown {
  return Array.isArray(value)
    ? value.map((item: unknown) =>
        typeof item === 'string' ? item.trim() : item,
      )
    : value;
}
