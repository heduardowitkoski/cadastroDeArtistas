# Diagramas Mermaid - Cadastro Municipal de Artistas

Este documento reúne os diagramas do sistema **Cadastro Municipal de Artistas** em formato **Mermaid**, que renderizam nativamente em visualizadores como o GitHub, GitLab e editores Markdown. Cobrem a arquitetura completa, incluindo o módulo de Feedback do Público.

---

## 1. Diagrama de Casos de Uso

```mermaid
flowchart LR
    A[Artista]
    V[Cidadão / Visitante]
    AD[Administrador - Secretaria de Cultura]

    subgraph S["Sistema Cadastro Municipal de Artistas"]
        UC1["Cadastrar-se no Sistema<br/>(/cadastrar)"]
        UC2["Visualizar Catálogo Público<br/>(mural de aprovados)"]
        UC3["Buscar e Filtrar por Categoria"]
        UC4["Visualizar Detalhes do Perfil"]
        UC5["Enviar Feedback / Avaliação<br/>(/feedback)"]
        UC6["Autenticar-se no Painel Admin<br/>(/admin/login)"]
        UC7["Visualizar Cadastros<br/>(Pendentes / Aprovados / Rejeitados)"]
        UC8["Aprovar / Rejeitar / Desaprovar Cadastro"]
        UC9["Editar Dados do Artista"]
        UC10["Excluir Cadastro Definitivamente"]
        UC11["Visualizar Feedbacks do Público"]
        UC12["Excluir Feedback"]
    end

    A --> UC1
    V --> UC2
    V --> UC3
    V --> UC4
    V --> UC5

    AD --> UC6
    AD --> UC7
    AD --> UC8
    AD --> UC9
    AD --> UC10
    AD --> UC11
    AD --> UC12

    UC1 -.-> UC7
```

---

## 2. Diagrama de Classes (Camada Técnica)

```mermaid
classDiagram
    class Artista {
        +id: number
        +nome: string
        +email: string
        +contato: string
        +cidade: string
        +area_atuacao: string
        +bio: string
        +foto_url: string
        +instagram: string
        +site: string
        +status: StatusArtista
        +created_at: Date
    }

    class StatusArtista {
        <<enumeration>>
        PENDENTE
        APROVADO
        REJEITADO
    }

    class Feedback {
        +id: number
        +nome: string
        +email: string
        +tipo: TipoFeedback
        +nota: number
        +mensagem: string
        +created_at: Date
    }

    class TipoFeedback {
        <<enumeration>>
        ELOGIO
        SUGESTAO
        CRITICA
        OUTRO
    }

    class ArtistasController {
        +findAll(): Promise~Artista[]~
        +findAprovados(): Promise~Artista[]~
        +create(body): Promise~Artista~
        +updateStatus(id, status): Promise~Artista~
        +update(id, body): Promise~Artista~
        +delete(id): Promise~object~
    }

    class ArtistasService {
        +findAll(): Promise~Artista[]~
        +findAprovados(): Promise~Artista[]~
        +create(dto): Promise~Artista~
        +updateStatus(id, status): Promise~Artista~
        +update(id, dto): Promise~Artista~
        +delete(id): Promise~object~
    }

    class FeedbackController {
        +findAll(): Promise~Feedback[]~
        +create(body): Promise~Feedback~
        +delete(id): Promise~object~
    }

    class FeedbackService {
        +findAll(): Promise~Feedback[]~
        +create(dto): Promise~Feedback~
        +delete(id): Promise~object~
    }

    class SupabaseService {
        +getClient(): SupabaseClient
    }

    ArtistasController --> ArtistasService : utilza
    ArtistasService --> SupabaseService : utilza
    FeedbackController --> FeedbackService : utilza
    FeedbackService --> SupabaseService : utilza
    ArtistasService ..> Artista : manipula
    FeedbackService ..> Feedback : manipula
    Artista --> StatusArtista
    Feedback --> TipoFeedback
```

---

## 3. Diagrama de Sequência: Cadastro de Artista

```mermaid
sequenceDiagram
    autonumber
    actor Artista
    participant Front as Frontend (React / Vite)
    participant Back as Backend (NestJS API)
    participant DB as Supabase (PostgreSQL)

    Artista->>Front: Preenche e envia formulário em 4 etapas
    Front->>Back: POST /artistas (dados do artista)
    Back->>DB: INSERT INTO artistas (status = 'Pendente')
    DB-->>Back: Confirmação e registro inserido
    Back-->>Front: HTTP 201 Created (objeto Artista)
    Front-->>Artista: Exibe "Cadastro enviado com sucesso!"
```

---

## 4. Diagrama de Sequência: Moderação Administrativa

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Front as Frontend (React / Vite)
    participant Auth as Supabase Auth
    participant Back as Backend (NestJS API)
    participant DB as Supabase (PostgreSQL)

    Admin->>Front: Acessa /admin/login
    Front->>Auth: signInWithPassword (e-mail / senha)
    Auth-->>Front: Sessão / Token
    Front->>Back: GET /artistas (lista completa)
    Back->>DB: SELECT * FROM artistas ORDER BY created_at DESC
    DB-->>Back: Registros retornados
    Back-->>Front: HTTP 200 OK
    Front-->>Admin: Painel com contadores e abas de status

    Admin->>Front: Clica em "Aprovar"/"Rejeitar"/"Desaprovar"
    Front->>Back: PATCH /artistas/{id}/status (novo status)
    Back->>DB: UPDATE artistas SET status = ... WHERE id = {id}
    DB-->>Back: Registro atualizado
    Back-->>Front: HTTP 200 OK
    Front-->>Admin: Lista e contadores atualizados
```

---

## 5. Diagrama de Sequência: Fluxo de Feedback do Público

```mermaid
sequenceDiagram
    autonumber
    actor Cidadao as Cidadão / Visitante
    participant Front as Frontend (React / Vite)
    participant Back as Backend (NestJS API)
    participant DB as Supabase (PostgreSQL)
    actor Admin as Administrador

    Cidadao->>Front: Preenche e envia formulário em /feedback
    Front->>Back: POST /feedbacks (nome/email opcionais, tipo, nota, mensagem)
    Back->>DB: INSERT INTO feedbacks
    DB-->>Back: Confirmação e registro inserido
    Back-->>Front: HTTP 201 Created
    Front-->>Cidadao: Exibe "Obrigado pelo seu feedback!"

    Admin->>Front: Acessa aba "Feedbacks" no painel /admin
    Front->>Back: GET /feedbacks
    Back->>DB: SELECT * FROM feedbacks ORDER BY created_at DESC
    DB-->>Back: Registros retornados
    Back-->>Front: HTTP 200 OK
    Front-->>Admin: Lista com tipo, nota e data

    Admin->>Front: Clica em "Excluir" em um feedback
    Front->>Back: DELETE /feedbacks/{id}
    Back->>DB: DELETE FROM feedbacks WHERE id = {id}
    DB-->>Back: Registro removido
    Back-->>Front: HTTP 200 OK
    Front-->>Admin: Lista atualizada
```

---

## 6. Diagrama de Entidade-Relacionamento (Banco de Dados)

```mermaid
erDiagram
    ARTISTAS {
        BIGINT id PK "IDENTITY"
        TEXT nome
        TEXT email
        TEXT contato
        TEXT cidade DEFAULT 'Bagé'
        TEXT area_atuacao
        TEXT bio
        TEXT foto_url
        TEXT instagram
        TEXT site
        TEXT status "Pendente/Aprovado/Rejeitado"
        TIMESTAMPTZ created_at
    }

    FEEDBACKS {
        BIGINT id PK "IDENTITY"
        TEXT nome
        TEXT email
        TEXT tipo "Elogio/Sugestão/Crítica/Outro"
        INTEGER nota "CHECK 1..5"
        TEXT mensagem
        TIMESTAMPTZ created_at
    }
```

---

## 7. Diagrama de Implantação / Arquitetura

```mermaid
graph LR
    subgraph Usuario["Dispositivo do Usuário"]
        NAV["Navegador Web<br/>(Chrome / Firefox / Edge)"]
    end

    subgraph Vercel["Nuvem Vercel - Frontend"]
        SPA["React SPA<br/>(Portal, Cadastro, Feedback, Admin)"]
    end

    subgraph Render["Nuvem Render - Backend"]
        API["Container Node.js / NestJS<br/>REST API (porta 3001)"]
    end

    subgraph Supabase["Nuvem Supabase - BaaS"]
        PG["PostgreSQL Database"]
        AUTH["Supabase Auth<br/>(login admin)"]
    end

    NAV -->|"HTTPS"| SPA
    SPA -->|"HTTP / REST (HTTPS)"| API
    SPA -->|"Autenticação Admin (HTTPS)"| AUTH
    API -->|"Supabase Client / PostgREST (HTTPS)"| PG
```

---

## 8. Mapa de Rotas da Aplicação

```mermaid
flowchart TD
    ROTA1["<b>/</b><br/>Portal - Mural público de artistas aprovados"]
    ROTA2["<b>/cadastrar</b><br/>Formulário de cadastro em 4 etapas"]
    ROTA3["<b>/feedback</b><br/>Avaliação e sugestões do público"]
    ROTA4["<b>/admin/login</b><br/>Login administrativo (Supabase Auth)"]
    ROTA5["<b>/admin</b><br/>Painel admin - protegido por PrivateRoute"]

    ROTA1 --> ROTA2
    ROTA1 --> ROTA3
    ROTA1 --> ROTA4
    ROTA4 --> ROTA5
    ROTA5 --> ROTA1
```