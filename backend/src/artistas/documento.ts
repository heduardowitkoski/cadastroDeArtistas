import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

function allEqual(value: string): boolean {
  return /^(\d)\1+$/.test(value);
}

export function isCpf(value: string): boolean {
  if (!/^\d{11}$/.test(value) || allEqual(value)) return false;
  for (let length = 9; length <= 10; length++) {
    const sum = [...value.slice(0, length)].reduce(
      (total, digit, index) => total + Number(digit) * (length + 1 - index),
      0,
    );
    const check = (sum * 10) % 11;
    if (Number(value[length]) !== (check === 10 ? 0 : check)) return false;
  }
  return true;
}

export function isCnpj(value: string): boolean {
  if (!/^[A-Z0-9]{12}\d{2}$/.test(value) || /^(.)\1{11}/.test(value))
    return false;
  for (const weights of [
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  ]) {
    const sum = weights.reduce(
      (total, weight, index) => total + (value.charCodeAt(index) - 48) * weight,
      0,
    );
    const remainder = sum % 11;
    const check = remainder < 2 ? 0 : 11 - remainder;
    if (Number(value[weights.length]) !== check) return false;
  }
  return true;
}

export function normalizeDocumento(value: unknown): unknown {
  if (value === null || value === '') return null;
  if (typeof value !== 'string') return value;
  const input = value.trim();
  if (!input) return null;
  const parts = input.split(/\s+\/\s+/);
  if (
    parts.length > 2 ||
    parts.some((part) => !/^[a-z\d.\-/\s]+$/i.test(part))
  ) {
    return input;
  }
  return parts
    .map((part) => part.replace(/[^a-z\d]/gi, '').toUpperCase())
    .join(' / ');
}

@ValidatorConstraint({ name: 'documentoCpfCnpj', async: false })
export class DocumentoCpfCnpjConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const parts = value.split(' / ');
    if (parts.length === 1) return isCpf(parts[0]) || isCnpj(parts[0]);
    return parts.length === 2 && isCpf(parts[0]) && isCnpj(parts[1]);
  }

  defaultMessage(): string {
    return 'cpf_cnpj deve conter CPF ou CNPJ válido';
  }
}
