# Diagramas UML - Cadastro Municipal de Artistas

Este documento reúne a especificação em código **PlantUML** dos principais diagramas de modelagem do sistema Cadastro Municipal de Artistas. Os códigos abaixo podem ser copiados e colados em editores como o [PlantText](https://www.planttext.com/) ou o servidor oficial do [PlantUML](http://www.plantuml.com/plantuml/).

---

## 1. Diagrama de Casos de Uso

```plantuml
@startuml Diagrama_de_Casos_de_Uso
left to right direction
skinparam packageStyle rectangle
skinparam shadowing false

actor "Artista" as artista
actor "Cidadão / Visitante" as visitante
actor "Administrador (Secretaria de Cultura)" as admin

rectangle "Sistema Cadastro Municipal de Artistas" {
  usecase "Cadastrar-se no Sistema" as UC1
  usecase "Visualizar Catálogo / Mural Público" as UC2
  usecase "Buscar e Filtrar Artistas por Categoria" as UC3
  usecase "Visualizar Detalhes do Perfil Artístico" as UC4
  usecase "Autenticar-se no Painel Admin" as UC5
  usecase "Visualizar Cadastros (Pendentes, Aprovados, Rejeitados)" as UC6
  usecase "Aprovar Cadastro de Artista" as UC7
  usecase "Rejeitar Cadastro de Artista" as UC8
  usecase "Desaprovar Cadastro de Artista" as UC9
}

artista --> UC1
visitante --> UC2
visitante --> UC3
visitante --> UC4

admin --> UC5
admin --> UC6
admin --> UC7
admin --> UC8
admin --> UC9

UC1 .> UC6 : <<include>>
@enduml
```

---

## 2. Diagrama de Classes (Domínio e Serviços)

```plantuml
@startuml Diagrama_de_Classes
skinparam classAttributeIconSize 0
skinparam shadowing false

enum StatusArtista {
  PENDENTE
  APROVADO
  REJEITADO
}

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

class ArtistasController {
  -artistasService: ArtistasService
  +findAll(): Promise<Artista[]>
  +findAprovados(): Promise<Artista[]>
  +create(body: Record<string, unknown>): Promise<Artista>
  +updateStatus(id: string, body: { status: string }): Promise<Artista>
}

class ArtistasService {
  -supabaseService: SupabaseService
  +findAll(): Promise<Artista[]>
  +findAprovados(): Promise<Artista[]>
  +create(createDto: Record<string, unknown>): Promise<Artista>
  +updateStatus(id: number, status: string): Promise<Artista>
}

class SupabaseService {
  -logger: Logger
  -supabase: SupabaseClient
  +getClient(): SupabaseClient
}

ArtistasController --> ArtistasService : utiliza
ArtistasService --> SupabaseService : utiliza
ArtistasService ..> Artista : manipula
Artista --> StatusArtista
@enduml
```

---

## 3. Diagrama de Sequência: Cadastro de Artista e Aprovação

```plantuml
@startuml Diagrama_de_Sequencia
autonumber
skinparam shadowing false

actor "Artista" as Artista
participant "Frontend (React / Vite)" as Front
participant "Backend (NestJS API)" as Back
database "Supabase (PostgreSQL)" as DB
actor "Administrador" as Admin

== Fluxo de Cadastro Autônomo ==
Artista -> Front: Preenche e envia formulário de cadastro
Front -> Back: POST /artistas (payload com dados do artista)
Back -> DB: INSERT INTO artistas (status = 'Pendente')
DB --> Back: Confirmação e dados inseridos
Back --> Front: HTTP 201 Created (Objeto Artista)
Front --> Artista: Exibe mensagem "Cadastro enviado com sucesso!"

== Fluxo de Moderação Administrativa ==
Admin -> Front: Realiza login em /admin/login
Front -> DB: Auth via Supabase Client (signInWithPassword)
DB --> Front: Sessão / Token retornado
Front -> Back: GET /artistas (com cabeçalho de autenticação)
Back -> DB: SELECT * FROM artistas ORDER BY created_at DESC
DB --> Back: Retorna lista completa de artistas
Back --> Front: HTTP 200 OK (Lista de Artistas)
Front --> Admin: Renderiza painel com cadastros 'Pendentes'

Admin -> Front: Clica em "Aprovar" no registro do artista
Front -> Back: PATCH /artistas/{id}/status (status: "Aprovado")
Back -> DB: UPDATE artistas SET status = 'Aprovado' WHERE id = {id}
DB --> Back: Registro atualizado
Back --> Front: HTTP 200 OK (Artista atualizado)
Front --> Admin: Atualiza lista e contadores na interface

== Consulta Pública Atualizada ==
Artista -> Front: Acesse o catálogo público /
Front -> Back: GET /artistas/aprovados
Back -> DB: SELECT * FROM artistas WHERE status = 'Aprovado'
DB --> Back: Lista de artistas aprovados
Back --> Front: HTTP 200 OK
Front --> Artista: Exibe o artista no mural público
@enduml
```

---

## 4. Diagrama de Implantação / Arquitetura

```plantuml
@startuml Diagrama_de_Implantacao
skinparam nodeAttributeIconSize 0
skinparam shadowing false

node "Dispositivo do Usuário" {
  artifact "Navegador Web (Chrome / Firefox / Edge)" {
    component "React SPA App (Vercel)" as SPA
  }
}

node "Nuvem Vercel (Hospedagem Frontend)" {
  folder "Estáticos & Assets" {
    [HTML5 / JS / CSS]
  }
}

node "Nuvem Render.com (Hospedagem Backend)" {
  node "Container Node.js / NestJS" {
    component "REST API Service (Porta 3001)" as API
  }
}

node "Nuvem Supabase (BaaS)" {
  database "PostgreSQL Database" as DB_Postgres {
    table "artistas"
  }
  component "Supabase Auth Service" as Auth
}

SPA -- API : HTTP / REST (HTTPS)
SPA -- Auth : Autenticação Admin (HTTPS)
API -- DB_Postgres : Supabase Client (PostgREST API / HTTPS)
@enduml
```
