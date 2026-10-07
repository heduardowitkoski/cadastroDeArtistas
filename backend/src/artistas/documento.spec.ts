import {
  DocumentoCpfCnpjConstraint,
  isCnpj,
  isCpf,
  normalizeDocumento,
} from './documento';

describe('documentos do cadastro', () => {
  const validator = new DocumentoCpfCnpjConstraint();

  it('normaliza documentos válidos sem mudar o campo TEXT existente', () => {
    expect(normalizeDocumento('529.982.247-25')).toBe('52998224725');
    expect(normalizeDocumento('529.982.247-25 / 04.252.011/0001-10')).toBe(
      '52998224725 / 04252011000110',
    );
    expect(validator.validate('52998224725 / 04252011000110')).toBe(true);
    expect(normalizeDocumento('12.abc.345/01de-35')).toBe('12ABC34501DE35');
    expect(isCnpj('12ABC34501DE35')).toBe(true);
  });

  it('rejeita sequências repetidas e dígitos verificadores incorretos', () => {
    expect(isCpf('00000000000')).toBe(false);
    expect(isCnpj('00000000000000')).toBe(false);
    expect(isCpf('52998224726')).toBe(false);
    expect(isCnpj('04252011000111')).toBe(false);
    expect(isCnpj('12ABC34501DE36')).toBe(false);
  });
});
