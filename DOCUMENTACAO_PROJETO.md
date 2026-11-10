# Relatório de Status e Documentação Técnica - Cadastro Municipal de Artistas
> **Ajustes finais da fila administrativa — 10/11/2026:** sidebar reduzida às cinco áreas operacionais existentes e cartão institucional de Bagé; KPIs mais compactos, números ampliados e microtextos descritivos compatíveis com os dados disponíveis (sem tendências históricas inventadas); proporção do drawer ampliada; alinhamento dos cards preservado; badge amarela removida e avatar reposicionado sobre o banner; aba ativa reforçada em azul. `npm run build` e `git diff --check` passaram. Sem alteração de APIs/dados e sem comparação visual autenticada. Requisitos relacionados: RNF-01/RNF-05.
> **Polimento de layout da fila administrativa — 10/11/2026:** a classe `sr-only` ausente foi definida localmente no painel, ocultando visualmente os rótulos acessíveis que vazavam como textos soltos na busca global e nos filtros. A barra de filtros mantém controles em linha no desktop e reflow em telas estreitas. Cards da fila agora quebram e limitam a biografia, alinham ações na mesma linha e usam padding maior; o drawer recebeu capa com foto do artista (ou imagem institucional quando não há foto), avatar sobreposto e sombra/borda lateral. `npm run build` e `git diff --check` passaram. Sem captura visual autenticada nem alteração funcional/backend. Requisito relacionado: RNF-01/RNF-05.
> **Refação visual do painel administrativo — 10/11/2026:** a área `/admin` recebeu header próprio com logo oficial existente, pesquisa global (inclui `Ctrl+K`), notificações calculadas dos pendentes e menu de sessão autenticada; a sidebar agora segue a referência com fila administrativa, cartão fotográfico de Bagé e foco inicial em Cadastros Pendentes. A lista/drawer usa informações reais do endpoint administrativo e mantém os handlers existentes. Números, perfis, tendências, nomes e contatos fictícios da imagem não foram copiados. Categorias, visão geral de eventos, relatórios, configurações e notas internas ainda não têm contratos de gerenciamento/persistência no produto; links indisponíveis e notas não persistidas não foram simulados como funcionais. Build passou; conferência em navegador autenticado bloqueada pela tela de login, sem testes de aprovação/rejeição nem alteração de banco. Requisitos relacionados: RF-07/RF-08/RF-09, RNF-01/RNF-02/RNF-05.
> **Administração: navegação sem cabeçalho público e fila de pendentes — 10/11/2026:** as rotas `/admin/*` ocultam o Navbar público; a navegação administrativa segue pela sidebar existente, em identidade azul com superfícies translúcidas. A aba Pendentes ganhou busca, filtros por categoria/cidade/disponibilidade, ordenação, contagens calculadas dos dados recebidos da API e painel de detalhes responsivo. Aprovar, rejeitar e editar continuam usando os handlers e endpoints existentes; portfólio/documentos encaminham à ferramenta de mídias protegidas já existente. Notas internas não foram criadas porque não há contrato de persistência/API para elas. A falha de runtime causada por importar o ícone `Instagram` (não exportado pela dependência instalada) foi corrigida com `Link2`; `npm run build` passou após a correção. Sem testes ou inspeção visual no browser, e sem alteração de banco. Requisitos relacionados: RF-07/RF-08/RF-09, RNF-01/RNF-05.
> **Confirmação LGPD no cadastro — 10/11/2026:** a etapa de revisão requer marcar a caixa de confirmação para habilitar “Enviar para análise”; `handleSubmit` também bloqueia qualquer chamada sem marcação, inclusive o botão “Salvar rascunho”, que atualmente compartilha o mesmo envio. O texto legal foi mantido. A concordância fica apenas no estado da tela: não é enviada, armazenada nem validada no backend nesta alteração. Sem build/testes ou envio de cadastro. Requisitos relacionados: RF-01/RF-02; nenhum CT associado sem validação no documento oficial.
> **Cadastro do artista: identidade visual e LGPD — 10/11/2026:** as quatro etapas do wizard usam os tokens locais azul, fundo claro, bordas frias e tipografia Inter/Plus Jakarta Sans; a folha compartilhada mantém o mesmo padrão na tela de edição existente. A revisão recebeu um bloco de privacidade em maior destaque, com título em negrito e ícone, mantendo intacta a declaração de tratamento de dados. Nenhuma regra, validação, persistência ou payload mudou. Inspecionado no browser em viewport móvel (~435 px) na etapa inicial; sem build, testes automatizados ou envio de cadastro. Requisito relacionado: RNF-01.
> **Paleta azul no cadastro do artista — 10/11/2026:** `/cadastrar` agora usa azul institucional nos destaques, etapas, progresso, foco dos campos, categorias, chips, disponibilidade, upload, prévia e ações. Inputs, cartões e fundo receberam tons frios; a marca do cabeçalho compacto também usa azul. Alteração apenas visual e escopada à página, sem mudança no fluxo ou payload. Sem build/testes nesta rodada. Requisitos relacionados: RNF-01.
> **Páginas Como Funciona e Feedback — 10/11/2026:** ambas agora usam o cabeçalho completo da home e uma faixa compartilhada com a imagem de Bagé, tons de azul e tipografia institucional. “Como funciona” recebeu cards, etapas e chamadas redesenhados; o formulário de feedback manteve validações e POST existentes, com campos e estados visuais atualizados. A lupa nessas páginas navega até a busca da home. Alteração local de frontend; build, automação, acessibilidade e envio real do feedback não foram executados. Requisitos relacionados: RF-11 (feedback) e RNF-01; nenhum CT foi associado sem validação no documento oficial.
> **Cores do menu móvel da home — 10/11/2026:** os estilos específicos do catálogo agora aplicam azul aos estados de entrar, cadastrar, hover e foco do drawer móvel, sem alterar o menu das outras rotas. Revisado visualmente em 390 px; nenhum fluxo ou dado mudou. Sem build ou testes automatizados nesta alteração de estilo. Requisito relacionado: RNF-01.
> **Refino responsivo do login administrativo — 10/11/2026:** removidos fundo, borda e blur dos itens de recursos; os ícones permanecem em círculos suaves. O painel esquerdo agora usa overlay azul escuro uniforme e texto claro. Em viewports até 1023 px, a coluna esquerda desaparece e o formulário centraliza em largura/altura disponíveis, com link de retorno no topo. Conferido em 1440×900, 1024 px, 1023 px e 390×844; sem overflow horizontal. Sem build ou testes automatizados nesta alteração visual. Requisitos: RF-07/RNF-01.

> **Refatoração do login administrativo — 10/11/2026:** /admin/login foi reorganizado em duas colunas com imagem real da Prefeitura enviada pelo usuário, sobreposição azul clara, marca do Conselho, lista de recursos, card centralizado, alerta contextual e controles de sessão/senha. O link de recuperação usa Supabase Auth; o redirecionamento exige /admin/login na allowlist de URLs do Supabase. A escolha de persistência do admin usa localStorage/sessionStorage no cliente Auth compartilhado; o login do artista restaura o padrão persistente. Acesso e papel admin continuam validados como antes. Revisão visual local em desktop (1440×900) e mobile; nenhum formulário foi enviado. Sem build/testes ou validação de recuperação no Supabase. Requisitos relacionados: RF-07, RNF-01/RNF-02; sem CT atribuído nesta rodada.

> **Simplificação do login administrativo — 10/11/2026:** removidos o cabeçalho global, o botão Home e a foto de Bagé dessa rota. O formulário fica em cartão central com largura de 50vw (máximo 920px), responsivo para telas estreitas. A marca e o nome do produto formam o link de retorno para `/`. A conferência visual local ocorreu em largura móvel (~434px); desktop e build não foram verificados. Autenticação não foi alterada. Requisito relacionado: RNF-01.

> **Telas de acesso e botão Admin — 10/11/2026:** login do artista recebeu o tema azul claro e a tipografia institucional Inter/Plus Jakarta Sans. O login administrativo foi reorganizado em duas colunas com a foto de Bagé existente, aviso de acesso restrito e formulário existente; em telas estreitas empilha os conteúdos. O link Admin foi recolocado na navegação pública da home e leva a `/admin/login`; essa rota mostra o cabeçalho compacto com a marca. Sign-in, checagem `app_metadata.role` e rotas não foram alterados. Revisão visual local feita no navegador em viewport móvel (~434px); desktop, lint/build e autenticação não foram verificados nesta rodada. Requisito relacionado: RNF-01.

> **Ajuste de cabeçalhos — 10/11/2026:** a imagem nova de logo recebida era JPG com quadriculado impresso, então a arte foi preparada como PNG transparente em `frontend/public/cmpcc-logo.png`, preservando a caixa de exibição atual (46×40px nas rotas comuns; 48×42px no topo do catálogo). A home mantém o cabeçalho completo. O fundo branco do CTA foi corrigido usando valores hex diretos: a variável azul anterior era escopada dentro do catálogo e não herdada pelo cabeçalho global. Cadastro, login e edição do artista mantêm a marca clicável e removem os dois botões do cabeçalho. Alteração local no frontend; não houve execução de lint/build nem inspeção em navegador.

> **Marca e cabeçalho global — 10/11/2026:** o emblema atualizado do Conselho está em `frontend/public/cmpcc-logo.png` e é usado na navegação compartilhada, rodapé e acessos de artista/admin. A `Navbar` foi centralizada em `AppRoutes`, portanto aparece em todas as rotas; o conjunto de marca e nome aponta para `/`. A configuração inicial da navegação compacta foi atualizada pela nota “Ajuste de cabeçalhos” acima: nas telas de cadastro/login/edição, apenas a marca permanece no cabeçalho. Requisito relacionado: RNF-01; não foi atribuído CT sem evidência no Documento de Testes.

> **Topo do catálogo — 10/11/2026:** a home ganhou marca e panorama recriados da referência, navegação azul, busca com atalho pela lupa e faixa expansível de categorias. Artes Cênicas agrupa Teatro, Dança e Circo somente no filtro, sem mudar o cadastro ou a API. O painel do banner usa apenas contagens da resposta pública de `GET /artistas/aprovados`; não há contador de eventos realizados. A entrada administrativa continua no rodapé e no menu móvel. Alteração local, apenas de frontend; [QA visual e evidências](design-qa.md). Requisitos: RF-04/RF-06, CT-RF06-03/05 e RNF-01.

> **Destaques e catálogo — 10/11/2026:** a apresentação inicial foi ajustada para até cinco cartões lado a lado, com foto cadastrada (ou fallback), selo demonstrativo “Disponível”, categoria, cidade, resumo, favorito local e link ao perfil completo. “Ver todos” expande a grade completa, agora no mesmo tema azul da home: bordas/sombras azuladas, botões de perfil azuis, categorias em cores suaves por área e rodapé azul somente no catálogo. Busca e filtros continuam usando os artistas aprovados retornados pela API; a antiga sidebar com destaque e números vazios saiu da home. O preview/fixture desta rodada contém três artistas, portanto mostra três cartões e não inventa os demais. Nenhuma API ou dado foi alterado. QA visual registrado em `design-qa.md`; comparação formal arquivada continua bloqueada pelo navegador. Requisitos: RF-04/RF-05/RF-06 e RNF-01.

> **Perfil completo — 23/10/2026, estado atual:** `/artistas/:id` substitui modal público; catálogo/destaque usam links. Nova arquitetura privada de foto/galeria/PDF no Supabase Storage, favoritos locais, visualizações por sessão/backend, membro desde real, compartilhamento e agenda administrável. Foto DataURL antiga permanece compatível; novos uploads são multipart e arquivo real. Vídeo/áudio e ownership continuam pendentes. 148 testes locais passaram, com API/Auth/Storage simulados em memória. Duas migrations versionadas **não foram aplicadas remotamente**; produção depende de revisão e [checklist](codex/output/ARTIST_PROFILE_DEPLOY_CHECKLIST.md). Entrega e confirmação do e-mail PASSOU conforme evidência humana, redirect FALHOU localhost e login aguarda reteste. Ver [relatório mestre](codex/output/COMPLETE_ARTIST_PROFILE_FEATURES_REPORT.md). Os estados anteriores abaixo são históricos quando divergirem desta atualização.

> **Estado reconciliado em 23/10/2026:** os rótulos “Concluído” abaixo registram implementação, não aceite final de produção. RLS já foi aplicado manualmente, acesso direto do browser foi restringido e o novo Render `cadastro-artistas-api-matheus` respondeu 200 em `/artistas/aprovados`. O backend local também funcionou pós-RLS. O frontend local foi atualizado para o novo Render, mas o bundle oficial inspecionado ainda aponta ao antigo; publicação e smoke tests permanecem pendentes. A-03 não está encerrado. Ver `codex/output/FRONTEND_NEW_RENDER_MIGRATION_REPORT.md` e a tabela atual de `BACKLOG_PRIORIZADO.md`.

> **Qualidade local — 23/10/2026:** mostrar/ocultar senha nos dois logins, Home sem encerrar sessão, busca por nome artístico, bio mínima de 20 caracteres e ajustes de contraste/reflow implementados. 99 testes locais passam; 122 CTs oficiais estão mapeados, com cobertura parcial. Cadastro agora solicita confirmação por `auth.resend` depois de salvar a ficha; SMTP, URLs e entrega real ainda exigem configuração/homologação. Ver [relatório mestre](codex/output/FRONT_QUALITY_INTEGRATION_ROUND_REPORT.md). Alterações locais, sem publicação nesta rodada.

> **Limites funcionais atuais:** autoedição do artista segue indisponível; categorias e obrigatoriedade CPF/CNPJ dependem de C-03/C-04. Cadastro usa Auth + ficha com compensação, sem transação única. Confirmação de e-mail não aprova ficha nem habilita ownership. Foto usa DataURL em `foto_url`; galeria/vídeo/áudio/documento não persistem. “Salvar rascunho” ainda chama o envio definitivo. Guards/DTOs e allowlist pública estão implementados; CRUD real, zoom/leitor, desempenho remoto e consentimento exigem homologação própria. A leitura remota pública desta rodada retornou 200 com 11 artistas sem dados privados.

## 1. Arquitetura Tecnológica Implementada

- **Front-end:** React (v19) + TypeScript + Vite + Vanilla CSS. Aplicação SPA (Single Page Application) responsiva, estruturada em componentes modulares, seguindo o **design system do Figma** (tema claro, paleta `#F8F7FF`/`#7C3AED`/`#1A1035`) aplicado ao catálogo público, área do artista, painel administrativo e telas de login/feedback.
- **Back-end:** NestJS (Node.js com TypeScript). API RESTful com arquitetura modular (Controllers, Services e Modules).
- **Banco de Dados e Autenticação:** Supabase (PostgreSQL para armazenamento relacional e Supabase Auth para autenticação administrativa).

---

## 2. Status de Desenvolvimento em Relação aos Marcos do Projeto

### 2.1. Marco 1: Entrada de Dados e Exposição

- **Formulário de Cadastro Autônomo**
  - **Status:** Concluído.
  - **Detalhamento:** Interface em quatro etapas progressivas (Dados básicos, Atuação, Portfólio e Revisão Final) com prévia de perfil em tempo real. Inclui novos campos **nome artístico**, **CPF/CNPJ**, **tags** (palavras-chave em matriz) e **disponibilidade para apresentações** (chips multisseleção), além das validações de campos obrigatórios, tamanho mínimo de biografia e envio com estado inicial "Pendente".

- **Catálogo Público em Formato de Mural**
  - **Status:** Concluído.
  - **Detalhamento:** Exibição dos artistas com status "Aprovado" em formato mural (grid de cards), busca e filtros por categoria. A home inicia com até cinco cartões de destaque e oferece expansão para o catálogo completo. O indicador visual "Disponível" permanece demonstrativo; favoritos têm persistência local. Perfil detalhado é uma página dedicada (`/artistas/:id`) e exibe dados públicos, portfólio, agenda, contato e links disponíveis. A faixa inicial usa apenas os registros retornados pelo catálogo público.

---

### 2.2. Marco 2: Gestão e Consulta

- **Ferramenta de Busca e Filtragem Avançada**
  - **Status:** Concluído.
  - **Detalhamento:** Mecanismo de busca textual por nome do artista ou área de atuação, integrado a seletores por categorias de arte (Música, Artes Visuais, Fotografia, Literatura, Teatro, Dança, Artesanato).

- **Painel Administrativo com Autenticação e Gestão Completa (CRUD)**
  - **Status:** Concluído.
  - **Detalhamento:** Autenticação via Supabase Auth (`/admin/login`) com tela reestilizada no tema administrativo, proteção de rota via `PrivateRoute` e painel de controle (`/admin`) com layout do Figma (sidebar escura, "Visão geral", contadores por status, gráfico de artistas por categoria e fila de análises pendentes). Mantém a gestão completa por status (Pendentes, Aprovados e Rejeitados), alteração de status (Aprovar/Rejeitar/Desaprovar), **edição direta dos cadastros** (incluindo novos campos tags/disponibilidade) via modal e **exclusão definitiva de registros** com confirmação de segurança.

---

### 2.3. Marco 3: Qualidade, Avaliação e Implantação

- **Formulário de Avaliação e Feedback do Público**
  - **Status:** Concluído.
  - **Detalhamento:** Página pública `/feedback` com formulário de avaliação da plataforma (nome/email opcionais, tipo do feedback — Elogio/Sugestão/Crítica/Outro —, nota de satisfação em estrelas de 1 a 5 e mensagem com validação de tamanho mínimo). Mensagens armazenadas na tabela `feedbacks` via `POST /feedbacks` e visualizadas no painel administrativo na aba "Feedbacks", com contador, exibição de nota e exclusão com confirmação de segurança.

- **Documentação de Uso e Relatório da Equipe**
  - **Status:** Em andamento.
  - **Detalhamento:** Elaboração dos manuais de utilização e registros técnicos de avaliação entre o resultado planejado e o alcançado.

- **Implantação Piloto e Orientação aos Servidores**
  - **Status:** Pendente.
  - **Detalhamento:** Treinamento dos servidores da Secretaria de Cultura e transferência da aplicação para o ambiente de homologação municipal.

---

## 3. Resumo das Tarefas Pendentes para Conclusão do Projeto

1. **Homologação e Treinamento:**
   - Realizar sessão de apresentação e capacitação com a equipe do Conselho Municipal de Políticas Culturais de Bagé.
   - Finalizar manuais operacionais do sistema.

> **Aviso de segurança (06/10/2026):** `backend/supabase.sql` é um script destrutivo de bootstrap: contém `DROP TABLE ... CASCADE`, recria `artistas` e `feedbacks`, insere exemplos e desativa RLS. **Não o execute sobre um banco existente, de homologação ou de produção.** A atualização segura do schema e das policies depende de uma etapa separada de migração e validação do estado real do banco. A orientação anterior de executá-lo para ativar colunas/feedback está revogada.

> **Obs.:** Favoritos, nota de eventos e "Disponível" no catálogo são elementos visuais de demonstração; o fluxo real de dados segue via API (`/artistas`, `/artistas/aprovados`, `/feedbacks`).

