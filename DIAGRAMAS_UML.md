# Diagramas UML - Cadastro Municipal de Artistas

Este documento reúne os diagramas do sistema **Cadastro Municipal de Artistas** em formato **PlantUML**, com linguagem simples para ser apresentado à equipe da Secretaria de Cultura e ao Conselho Municipal de Políticas Culturais. Os códigos podem ser copiados e colados em editores como o [PlantText](https://www.planttext.com/) ou o servidor oficial do [PlantUML](http://www.plantuml.com/plantuml/).

---

## 1. Diagrama de Casos de Uso

Mostra **quem** usa o sistema e **o que** cada um pode fazer:

```plantuml
@startuml Diagrama_de_Casos_de_Uso
left to right direction
skinparam packageStyle rectangle
skinparam shadowing false

actor "Artista" as artista
actor "Cidadão / Visitante" as visitante
actor "Equipe da Cultura (Administrador)" as admin

rectangle "Sistema Cadastro de Artistas de Bagé" {
  usecase "Fazer a inscrição (4 passos)" as UC1
  usecase "Ver o mural de artistas" as UC2
  usecase "Buscar e filtrar por categoria" as UC3
  usecase "Ver o perfil de um artista" as UC4
  usecase "Avaliar a plataforma (feedback)" as UC10
  usecase "Entrar com usuário e senha" as UC5
  usecase "Ver as inscrições recebidas" as UC6
  usecase "Aprovar inscrição" as UC7
  usecase "Rejeitar inscrição" as UC8
  usecase "Retirar um artista do mural" as UC9
  usecase "Ler as avaliações do público" as UC11
  usecase "Remover uma avaliação" as UC12
}

artista --> UC1
visitante --> UC2
visitante --> UC3
visitante --> UC4
visitante --> UC10

admin --> UC5
admin --> UC6
admin --> UC7
admin --> UC8
admin --> UC9
admin --> UC11
admin --> UC12

UC1 .> UC6 : <<inclui>>
@enduml
```

---

## 2. Diagrama de Entidades e Perfis

Mostra quem participa do sistema e **o que é guardado** sobre cada pessoa:

```plantuml
@startuml Diagrama_de_Entidades
skinparam classAttributeIconSize 0
skinparam shadowing false

actor "Artista" as A
actor "Cidadão / Visitante" as V
actor "Equipe da Cultura" as E

class "Ficha do Artista" {
  nome
  email
  telefone
  cidade
  área artística
  mini-bio
  foto
  instagram
  site
  situação: Pendente / Aprovado / Rejeitado
  data do cadastro
}

class "Avaliação (Feedback)" {
  nome (opcional)
  email (opcional)
  tipo: Elogio / Sugestão / Crítica / Outro
  nota (1 a 5)
  mensagem
  data
}

A --> "Ficha do Artista" : preenche
V --> "Avaliação (Feedback)" : envia
E --> "Ficha do Artista" : analisa e muda a situação
E --> "Avaliação (Feedback)" : lê e pode remover
@enduml
```

---

## 3. Diagrama de Sequência: Inscrição e Aprovação

A jornada completa, da inscrição de um artista até ele aparecer no mural público:

```plantuml
@startuml Diagrama_de_Sequencia
autonumber
skinparam shadowing false

actor "Artista" as Artista
participant "Site" as Front
participant "Central do sistema" as Back
database "Almoxarifado (banco de dados)" as DB
actor "Equipe da Cultura" as Admin

== 1. Inscrição do artista ==
Artista -> Front: Preenche o formulário (nome, contato, área, história)
Front -> Back: Envia a inscrição
Back -> DB: Guarda a ficha com a marca "Pendente"
DB --> Back: Confirma que a ficha foi guardada
Back --> Front: Avisa o site
Front --> Artista: Mostra "Cadastro enviado com sucesso!"

== 2. Análise da equipe ==
Admin -> Front: Entra com usuário e senha
Admin -> Front: Abre a lista de inscrições
Front -> Back: Pede a lista de fichas
Back -> DB: Busca as fichas
DB --> Back: Devolve as fichas
Back --> Front: Mostra na tela
Front --> Admin: Vê os cadastros (Pendentes, Aprovados, Rejeitados)

Admin -> Front: Clica em "Aprovar" na ficha do artista
Front -> Back: Pede para atualizar a ficha
Back -> DB: Marca como "Aprovado"
DB --> Back: Confirma a mudança
Back --> Front: Atualiza a tela
Front --> Admin: O artista já aparece no mural público

== 3. Consulta pública ==
Artista -> Front: Abre o mural público
Front -> Back: Pede os artistas aprovados
Back -> DB: Busca somente as fichas "Aprovado"
DB --> Back: Devolve os artistas aprovados
Back --> Front: Mostra na tela
Front --> Artista: Vê o artista no mural
@enduml
```

---

## 4. Diagrama de Sequência: Avaliação do Público (Feedback)

Do momento em que o cidadão dá sua opinião até a equipe ler:

```plantuml
@startuml Diagrama_de_Sequencia_Feedback
autonumber
skinparam shadowing false

actor "Cidadão" as Cidadao
participant "Site" as Front
participant "Central do sistema" as Back
database "Almoxarifado (banco de dados)" as DB
actor "Equipe da Cultura" as Admin

== 1. O cidadão avalia ==
Cidadao -> Front: Preenche "Deixe seu feedback" (nota e mensagem)
Front -> Back: Envia a avaliação
Back -> DB: Guarda a avaliação
DB --> Back: Confirma
Back --> Front: Avisa o site
Front --> Cidadao: Mostra "Obrigado pelo seu feedback!"

== 2. A equipe lê ==
Admin -> Front: Abre a área de feedbacks no painel
Front -> Back: Pede as avaliações
Back -> DB: Busca as avaliações
DB --> Back: Devolve as avaliações
Back --> Front: Mostra na tela
Front --> Admin: Lê as opiniões da população
@enduml
```

---

## 5. Diagrama de Implantação (Onde o sistema mora)

Uma visão simples de como as partes do sistema se conectam na internet:

```plantuml
@startuml Diagrama_de_Implantacao
skinparam nodeAttributeIconSize 0
skinparam shadowing false

node "Computador ou celular do usuário" {
  artifact "Navegador de internet (Chrome / Firefox / Edge)" {
    component "Site - parte que todo mundo vê" as SPA
  }
}

node "Vitrine na internet (Vercel)" {
  folder "Páginas do site" {
    [Mural, Inscrição, Avaliação, Painel da equipe]
  }
}

node "Central de atendimento (Render.com)" {
  node "Servidor do sistema" {
    component "Parte que processa os pedidos" as API
  }
}

node "Almoxarifado + Portaria (Supabase)" {
  database "Banco de dados" as DB_Postgres {
    storage "Fichas dos artistas" as TabArtistas
    storage "Avaliações do público" as TabFeedbacks
  }
  component "Portaria de segurança (login da equipe)" as Auth
}

SPA -- API : "faz pedidos"
SPA -- Auth : "entrada da equipe"
API -- DB_Postgres : "guarda e busca dados"
@enduml
```