# Confirmação de e-mail — 23/10/2026

**CÓDIGO PRONTO; CONFIGURAÇÃO REMOTA PENDENTE.** Contratos testados com mocks; envio/recebimento/click real BLOQUEADOS porque o usuário informou não haver caixa de teste controlada. Nenhuma confirmação foi desabilitada e nenhum e-mail real foi solicitado nesta rodada.

## Causa e decisão

O backend já usava `auth.admin.createUser({email, password, email_confirm:false})`, seguido de inserção da ficha Pendente. Essa operação administrativa cria conta não confirmada e não deve ser confundida com signup que dispara confirmação. A ausência de envio no fluxo explica uma conta poder ficar impedida de entrar mesmo com ficha existente. A mensagem antiga do login orientava mexer na proteção; agora apresenta instrução amigável para conferir caixa de entrada e spam.

Foram estudados signUp e resend. **Decisão técnica:** conservar criação administrativa server-side para conhecer inequivocamente o UID recém-criado e preservar a compensação existente; após confirmar inserção da ficha, solicitar `auth.resend({type:'signup', email, options:{emailRedirectTo:'https://cadastro-de-artistas.vercel.app/artista/login'}})`. O endpoint de resend do Auth localiza usuário não confirmado e solicita confirmação; essa escolha decorre da leitura da implementação oficial, sem teste real de entrega deste projeto. SignUp é alternativa válida, mas respostas ofuscadas para contas existentes não autorizam apagar às cegas um UID em compensação. Não houve migração de signup ao browser.

Fontes primárias consultadas: [createUser](https://supabase.com/docs/reference/javascript/auth-admin-createuser), [implementação administrativa](https://github.com/supabase/supabase-js/blob/master/packages/core/auth-js/src/GoTrueAdminApi.ts), [signUp](https://supabase.com/docs/reference/javascript/auth-signup), [resend](https://supabase.com/docs/reference/javascript/auth-resend), [implementação do resend no Auth](https://raw.githubusercontent.com/supabase/auth/master/internal/api/resend.go). A inferência operacional sobre createUser+resend deve ser homologada na versão/configuração hospedada.

## Fluxo implementado

1. POST público validado server-side; procura duplicidade na ficha.
2. Auth administrativo cria conta nova não confirmada. Senha permanece só nessa chamada; removida do payload da ficha.
3. Insere ficha com status Pendente, sem senha e sem novo vínculo UID–ficha/schema.
4. Falha explícita de banco: compensa apenas a conta recém-criada; não envia confirmação. Resultado ambíguo: sinaliza revisão manual, sem apagar conta às cegas.
5. Inserção confirmada: solicita confirmação via cliente Auth público separado e redirect fixo oficial. Não aceita redirect do POST.
6. API 201 retorna `{id, status:'Pendente', email_verification:'requested'|'pending'}`. `requested` significa solicitação aceita pelo Auth, **não entrega comprovada**. Falha do mailer retorna pending, mantém ficha/conta e registra aviso genérico sem endereço/senha/token.
7. Front distingue solicitação aceita de envio pendente e informa caixa/spam quando apropriado. Login de e-mail não confirmado explica a situação; não mostra instrução técnica do Supabase nem recomenda desabilitar Confirm Email.
8. Após confirmação real, Auth deve permitir signInWithPassword. Nesta rodada foram simulados os estados antes/depois. Confirmar e-mail não aprova a ficha nem cria privilégios admin. Autoedição segue bloqueada por C-02; ownership não foi implementado.

## Código e testes

Alterados `backend/src/artistas/artistas.service.ts`, cadastro e login artista, novo `authMessages.ts`. DTO/validação de bio 20..2000 decorrem do CT-RF02-09, não do e-mail. Arquivos E/W/F e logs são detalhados no relatório de integração.

Asserções: Auth com email_confirm: false, sem senha na ficha, duplicidade não cria outra conta, falha Auth não insere, falha DB compensa conta nova, ambiguidade não apaga, redirect exato, resend não recebe senha, falha de e-mail mantém ficha/conta, falha DB não envia, mensagem de não confirmado e erros genéricos. Navegador: não confirmado rejeitado com mensagem apropriada; estado confirmado simulado chega à área indisponível e Home preserva sessão. Esses testes não comprovam a transição criptográfica/entrega real do Supabase.

## Checklist Supabase para operador autorizado

- [ ] Authentication / Email Provider: habilitar provedor e manter **Confirm email ativado**.
- [ ] Configurar SMTP customizado com remetente e domínio verificados; credenciais exclusivamente no painel/segredo externo, nunca em código, docs, chat ou frontend.
- [ ] Revisar domínio remetente e autenticação recomendada pelo provedor; limites de envio, cooldown e proteção contra abuso. O SMTP padrão do Supabase tem restrições e não serve como prova de entrega geral.
- [ ] Site URL: `https://cadastro-de-artistas.vercel.app`.
- [ ] Redirect URLs: permitir exatamente `https://cadastro-de-artistas.vercel.app/artista/login`; evitar wildcard amplo e localhost em produção.
- [ ] Template de confirmação: utilizar fluxo de confirmação do Supabase (`ConfirmationURL` conforme template oficial), sem substituir pelo redirect puro, sem expor segredo.
- [ ] Conferir a política de senha do projeto contra os limites da aplicação e os erros tratados. Não relaxar política para fazer o teste passar.
- [ ] Publicar backend e frontend revisados. Esta rodada deixou alterações locais, sem commit/push/deploy.
- [ ] Com caixa controlada, cadastrar fixture identificada, conferir Auth não confirmado + ficha Pendente, receber e-mail, clicar uma vez, verificar redirect/login, confirmar que aprovação administrativa permanece separada.
- [ ] Testar link expirado/usado, timeout/erro SMTP e login antes/depois; registrar somente códigos/IDs sanitizados, nunca link de confirmação/JWT/senha.

Referências de configuração: [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [senhas](https://supabase.com/docs/guides/auth/passwords), [URLs/configuração geral](https://supabase.com/docs/guides/auth/general-configuration).

## Pendências e recuperação

Não existe botão público de reenvio nem endpoint de recuperação novo: não foi adicionado um controle sem serviço real. Contas antigas não confirmadas não recebem envio retroativo automaticamente; o operador deve usar um fluxo suportado de reenvio com conta/endereço controlados ou projetar endpoint com rate limit, resposta não enumerável e proteção contra abuso em rodada própria. Se pending persistir, repetir cadastro pode resultar em 409; suporte/reenvio deve recuperar a conta existente, nunca recriá-la ou apagar conta real. Solicitação de mail é aguardada no cadastro e pode aumentar latência conforme Auth/SMTP; monitorar timeouts antes do deploy. Não há transação única entre Auth e Postgres nem correção concorrente de duplicidade nesta rodada.
