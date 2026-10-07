export const onlyDigits = (value: string) => value.replace(/\D/g, '')

export function maskCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11)
  return digits.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

export function maskCnpj(value: string): string {
  const characters = value.replace(/[^a-z\d]/gi, '').toUpperCase().slice(0, 14)
  return characters.replace(/^([A-Z\d]{2})([A-Z\d])/, '$1.$2').replace(/^([A-Z\d]{2})\.([A-Z\d]{3})([A-Z\d])/, '$1.$2.$3').replace(/^([A-Z\d]{2})\.([A-Z\d]{3})\.([A-Z\d]{3})([A-Z\d])/, '$1.$2.$3/$4').replace(/^([A-Z\d]{2})\.([A-Z\d]{3})\.([A-Z\d]{3})\/([A-Z\d]{4})([A-Z\d])/, '$1.$2.$3/$4-$5')
}

export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length <= 2) return digits ? `(${digits}` : ''
  const area = `(${digits.slice(0, 2)}) `
  const number = digits.slice(2)
  if (number.length <= 4) return area + number
  const split = digits.length === 11 ? 5 : 4
  return `${area}${number.slice(0, split)}-${number.slice(split)}`
}

export function validCpf(value: string): boolean {
  const digits = onlyDigits(value)
  if (!/^\d{11}$/.test(digits) || /^(\d)\1+$/.test(digits)) return false
  for (let length = 9; length <= 10; length++) {
    const sum = [...digits.slice(0, length)].reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0)
    const check = (sum * 10) % 11
    if (Number(digits[length]) !== (check === 10 ? 0 : check)) return false
  }
  return true
}

export function validCnpj(value: string): boolean {
  const characters = value.replace(/[^a-z\d]/gi, '').toUpperCase()
  if (!/^[A-Z\d]{12}\d{2}$/.test(characters) || /^(.)\1{11}/.test(characters)) return false
  for (const weights of [
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  ]) {
    const sum = weights.reduce((total, weight, index) => total + (characters.charCodeAt(index) - 48) * weight, 0)
    const remainder = sum % 11
    if (Number(characters[weights.length]) !== (remainder < 2 ? 0 : 11 - remainder)) return false
  }
  return true
}

export interface CadastroFields {
  nome: string
  nome_artistico: string
  cpf: string
  cnpj: string
  email: string
  contato: string
  cidade: string
  categorias: string[]
  bio: string
  tags: string[]
  disponibilidade: string[]
  foto_url: string
  instagram: string
  site: string
}

export type CadastroField = keyof CadastroFields | 'senha' | 'confirmarSenha' | 'documento'
export type CadastroErrors = Partial<Record<CadastroField, string>>

function validHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname.includes('.'))
  } catch {
    return false
  }
}

export function validateCadastro(form: CadastroFields, senha: string, confirmarSenha: string): CadastroErrors {
  const errors: CadastroErrors = {}
  if (form.nome.trim().length < 2 || form.nome.trim().length > 120) errors.nome = 'Informe um nome de 2 a 120 caracteres.'
  if (form.nome_artistico.trim().length > 120) errors.nome_artistico = 'O nome artístico deve ter até 120 caracteres.'
  if (!form.cpf && !form.cnpj) errors.documento = 'Informe ao menos CPF ou CNPJ para prosseguir.'
  if (form.cpf && !validCpf(form.cpf)) errors.cpf = 'Informe um CPF válido.'
  if (form.cnpj && !validCnpj(form.cnpj)) errors.cnpj = 'Informe um CNPJ válido.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || form.email.length > 254) errors.email = 'Informe um e-mail válido.'
  if (!/^\d{10,11}$/.test(onlyDigits(form.contato))) errors.contato = 'Informe telefone com DDD e 10 ou 11 dígitos.'
  if (form.cidade.length > 120) errors.cidade = 'A cidade deve ter até 120 caracteres.'
  if (senha.length < 6 || senha.length > 128) errors.senha = 'A senha deve ter pelo menos 6 e no máximo 128 caracteres.'
  if (!confirmarSenha || senha !== confirmarSenha) errors.confirmarSenha = 'As senhas devem coincidir.'
  if (!form.categorias.length || form.categorias.join(', ').length > 500) errors.categorias = 'Selecione ao menos uma categoria.'
  if (form.bio.length > 2000) errors.bio = 'A mini-bio deve ter até 2000 caracteres.'
  if (form.tags.length > 20) errors.tags = 'Selecione até 20 tags.'
  if (form.disponibilidade.length > 10) errors.disponibilidade = 'Selecione até 10 opções de disponibilidade.'
  if (form.instagram && !/^(@?[a-z\d._]{1,30}|https?:\/\/(www\.)?instagram\.com\/[a-z\d._]+\/?)$/i.test(form.instagram.trim())) errors.instagram = 'Informe @perfil ou um link válido do Instagram.'
  if (form.site && !validHttpUrl(form.site)) errors.site = 'Informe um link http(s) válido para o site.'
  if (form.foto_url.length > 5_000_000) errors.foto_url = 'O endereço da foto é grande demais.'
  return errors
}

const fieldsByStep: CadastroField[][] = [
  ['nome', 'nome_artistico', 'cpf', 'cnpj', 'documento', 'email', 'contato', 'cidade', 'senha', 'confirmarSenha'],
  ['categorias', 'bio', 'tags', 'disponibilidade'],
  ['foto_url', 'instagram', 'site'],
  [],
]

export function firstInvalidStep(errors: CadastroErrors): number {
  return fieldsByStep.findIndex((fields) => fields.some((field) => Boolean(errors[field])))
}

export function hasStepErrors(errors: CadastroErrors, step: number): boolean {
  return fieldsByStep[step]?.some((field) => Boolean(errors[field])) ?? false
}
