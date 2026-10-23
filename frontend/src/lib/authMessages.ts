export function artistLoginError(error: { message: string; code?: string }): string {
  const message = error.message.toLowerCase();
  if (error.code === 'email_not_confirmed' || message.includes('email not confirmed') || message.includes('não confirmado')) {
    return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e a pasta de spam.';
  }
  if (error.code === 'invalid_credentials' || message.includes('invalid login credentials') || message.includes('credenciais inválidas')) {
    return 'E-mail ou senha incorretos.';
  }
  return 'Não foi possível entrar. Tente novamente em alguns instantes.';
}
