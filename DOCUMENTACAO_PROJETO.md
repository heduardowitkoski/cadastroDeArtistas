# Relatório de Documentação Técnica - Cadastro Municipal de Artistas

## 1. Identificação do Projeto Institucional

- **Título do Projeto:** Cadastro Municipal de Artistas
- **Instituição:** Universidade Federal do Pampa (UNIPAMPA) - Campus Bagé
- **Curso:** Engenharia de Computação (BAEC)
- **Programa:** 1ª Edição do Programa Institucional EPEC (Escritório de Projetos da Engenharia de Computação)
- **Registro Institucional:** 2025.EX.BG.4070
- **Coordenador:** Prof. Dr. Leonardo Bidese de Pinho
- **Co-coordenador:** Prof. Dr. Carlos Michel Betemps
- **Entidade Demandante / Parceira:** Conselho Municipal de Políticas Culturais de Bagé / Secretaria Municipal de Cultura

---

## 2. Visão Geral e Objetivos

O projeto tem por objetivo o desenvolvimento e implantação de uma solução web centralizada para mapeamento, catalogação e divulgação dos profissionais culturais, artesãos e artistas do município de Bagé - RS. A plataforma visa solucionar a ausência de um canal oficial consolidado, permitindo o cadastro autônomo de artistas, a consulta pública de portfólios e o gerenciamento administrativo pela Secretaria de Cultura para curadoria de eventos e chamamentos públicos.

---

## 3. Comparativo de Arquitetura Tecnológica

### 3.1. Tecnologias Especificadas na Proposta
- **Front-end:** React + TypeScript (Licença MIT / Apache 2.0).
- **Back-end:** Spring Boot (Licença Apache 2.0).
- **Banco de Dados:** Supabase (PostgreSQL + Auth + Storage).

### 3.2. Tecnologias Efetivamente Implementadas
- **Front-end:** React (v19) + TypeScript + Vite + Vanilla CSS, estruturado em arquitetura baseada em componentes reutilizáveis.
- **Back-end:** NestJS (Node.js com TypeScript), mantendo a arquitetura RESTful modular e tipagem unificada com o ecossistema JavaScript/TypeScript.
- **Banco de Dados e Autenticação:** Supabase (PostgreSQL para armazenamento relacional e Supabase Auth para autenticação administrativa).

---

## 4. Status de Desenvolvimento em Relação aos Marcos do Projeto

### 4.1. Marco 1: Entrada de Dados e Exposição

- **Formulário de Cadastro Autônomo**
  - **Status:** Concluído.
  - **Detalhamento:** Interface em quatro etapas progressivas (Dados Pessoais, Área Artística/Bio, Portfólio/Links e Revisão Final). Inclui validações de campos obrigatórios, tamanho mínimo de biografia, conformidade com a LGPD e envio com estado inicial "Pendente".

- **Catálogo Público em formato de Mural**
  - **Status:** Concluído.
  - **Detalhamento:** Exibição dos artistas com status "Aprovado". Apresenta cards informativos, foto/placeholder, área de atuação com etiquetas visuais, mini-bio, modal de perfil detalhado com links diretos (Instagram, Site e Telefone) e indicadores numéricos de cadastro.

---

### 4.2. Marco 2: Gestão e Consulta

- **Ferramenta de Busca e Filtragem Avançada**
  - **Status:** Concluído.
  - **Detalhamento:** Mecanismo de busca textual em tempo real por nome do artista ou área de atuação, integrado a seletores por categorias de arte (Música, Artes Visuais, Fotografia, Literatura, Teatro, Dança, Artesanato).

- **Painel Administrativo com Autenticação**
  - **Status:** Parcialmente Concluído.
  - **Detalhamento:** 
    - *Implementado:* Autenticação de administradores via Supabase Auth (`/admin/login`), proteção de rota via `PrivateRoute`, painel de controle (`/admin`) com navegação por abas de status (Pendentes, Aprovados e Rejeitados), contadores e ações para alteração de status (Aprovação, Rejeição e Desaprovação).
    - *Pendente:* Edição direta dos dados dos cadastros pelos administradores no painel e funcionalidade de exclusão definitiva (remoção de registro).

---

### 4.3. Marco 3: Qualidade, Avaliação e Implantação

- **Segurança de Dados e RLS (Row-Level Security)**
  - **Status:** Concluído.
  - **Detalhamento:** Configuração das políticas de acesso à tabela de artistas no Supabase e envio de dados sob consentimento expresso da LGPD.

- **Formulário de Avaliação e Feedback do Público**
  - **Status:** Pendente.
  - **Detalhamento:** Inclusão de módulo ou página para coleta de opiniões e sugestões dos cidadãos quanto à usabilidade da plataforma (previsto no documento do projeto).

- **Documentação de Uso e Relatório da Equipe**
  - **Status:** Em andamento.
  - **Detalhamento:** Elaboração dos manuais de utilização e registros técnicos de avaliação entre o resultado planejado e o alcançado.

- **Implantação Piloto e Orientação aos Servidores**
  - **Status:** Pendente.
  - **Detalhamento:** Treinamento dos servidores da Secretaria de Cultura e transferência da aplicação para o ambiente de homologação municipal.

---

## 5. Resumo das Tarefas Pendentes para Conclusão do Projeto

1. **Implementar Edição e Remoção de Cadastros no Painel Administrativo:**
   - Adicionar modal ou formulário de edição de dados dos artistas na visão do administrador.
   - Adicionar endpoint e botão de exclusão de registros (`DELETE /artistas/:id`).

2. **Desenvolver Módulo de Feedback do Público:**
   - Criar formulário de avaliação da plataforma para coleta de sugestões de melhoria por parte da população.

3. **Homologação e Treinamento:**
   - Realizar sessão de apresentação e capacitação com a equipe da Secretaria Municipal de Cultura de Bagé.
   - Finalizar manuais operacionais do sistema.
