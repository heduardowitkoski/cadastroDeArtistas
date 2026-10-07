import assert from 'node:assert/strict'
import test from 'node:test'
import { maskCpf, maskCnpj, maskPhone, validCpf, validCnpj, validateCadastro, firstInvalidStep } from '../src/lib/cadastroValidation.ts'

const validForm = {
  nome: 'Maria Artista', nome_artistico: '', cpf: '529.982.247-25', cnpj: '',
  email: 'maria@example.com', contato: '(53) 99999-0000', cidade: 'Bagé',
  categorias: ['Música'], bio: '', tags: [], disponibilidade: [],
  foto_url: '', instagram: '@maria.artista', site: 'https://example.com',
}

test('máscaras limitam CPF, CNPJ e telefone ao formato brasileiro', () => {
  assert.equal(maskCpf('52998224725123'), '529.982.247-25')
  assert.equal(maskCnpj('04252011000110'), '04.252.011/0001-10')
  assert.equal(maskCnpj('12abc34501de35'), '12.ABC.345/01DE-35')
  assert.equal(maskPhone('53999990000'), '(53) 99999-0000')
})

test('dígitos verificadores rejeitam sequências inválidas', () => {
  assert.equal(validCpf('529.982.247-25'), true)
  assert.equal(validCnpj('04.252.011/0001-10'), true)
  assert.equal(validCnpj('12.ABC.345/01DE-35'), true)
  assert.equal(validCnpj('12.ABC.345/01DE-36'), false)
  assert.equal(validCpf('00000000000'), false)
  assert.equal(validCnpj('00000000000000'), false)
})

test('validação indica a primeira etapa com erro', () => {
  assert.deepEqual(validateCadastro(validForm, 'senha123', 'senha123'), {})
  const errors = validateCadastro({ ...validForm, cpf: '00000000000' }, 'senha123', 'senha123')
  assert.equal(errors.cpf, 'Informe um CPF válido.')
  assert.equal(firstInvalidStep(errors), 0)
})
