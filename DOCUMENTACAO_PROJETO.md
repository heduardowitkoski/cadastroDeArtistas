# Relatório de Status e Documentação Técnica - Cadastro Municipal de Artistas

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
  - **Detalhamento:** Exibição dos artistas com status "Aprovado" em formato mural (grid de cards) com busca, filtros por categoria, indicador visual "Disponível", favoritos (placeholder visual) e painel lateral com artista em destaque, estatísticas reais do catálogo e chamada para cadastro. Modal de perfil detalhado exibe bio, tags, disponibilidade e links diretos (Instagram, Site e Telefone).

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
