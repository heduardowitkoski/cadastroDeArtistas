# Ilustração do Sistema - Cadastro Municipal de Artistas

Este documento explica, de forma simples e visual, o sistema de **Cadastro Municipal de Artistas** de Bagé. Os diagramas usam o formato **Mermaid**, que pode ser visto direto no GitHub (é só trocar a aba para "Preview" ou abrir pelo próprio site do GitHub).

---

## 1. Quem usa o sistema

O sistema tem três tipos de usuários. Cada um tem seu papel:

```mermaid
flowchart TD
    Artista["🧑‍🎨 Artista<br/><i>Quem cria arte e quer aparecer</i>"]
    Cidadao["👥 Cidadão / Visitante<br/><i>Toda a comunidade de Bagé</i>"]
    Equipe["🏛️ Equipe da Cultura<br/><i>Servidores da Secretaria</i>"]

    Artista -->|"Faz a inscrição<br/>e divulga seu trabalho"| SISTEMA
    Cidadao -->|"Conhece os artistas<br/>e opina sobre o site"| SISTEMA
    Equipe -->|"Confere, aprova<br/>e mantém tudo em dia"| SISTEMA

    SISTEMA[Sistema Cadastro de Artistas<br/>de Bagé]
```

---

## 2. O que dá para fazer no sistema

Resumo dos recursos, organizados por quem usa:

```mermaid
flowchart LR
    subgraph Artista["Artista"]
        A1["Fazer a inscrição<br/>em 4 passos"]
    end

    subgraph Visitante["Cidadão / Visitante"]
        V1["Ver o mural de artistas"]
        V2["Buscar por nome ou categoria"]
        V3["Ver o perfil de um artista"]
        V4["Avaliar a plataforma"]
    end

    subgraph Admin["Equipe da Cultura"]
        E1["Entrar com usuário e senha"]
        E2["Ver as inscrições recebidas"]
        E3["Aprovar / devolver / rejeitar"]
        E4["Corrigir dados do artista"]
        E5["Remover um cadastro"]
        E6["Ler as avaliações do público"]
    end
```

---

## 3. Jornada: como um artista se cadastra

A história do João, artista de Bagé, usando o sistema pela primeira vez:

```mermaid
sequenceDiagram
    autonumber
    actor J as João (artista)
    participant S as Site
    participant C as Central do sistema
    participant B as Almoxarifado (dados)

    J->>S: Preenche o formulário de inscrição<br/>(nome, contato, área artística, história, links)
    S->>C: Envia a inscrição
    C->>B: Guarda a ficha do João com a marca<br/>"Pendente" (aguardando análise)
    B-->>C: Confirma que a ficha foi guardada
    C-->>S: Avisa o site
    S-->>J: Mostra "Cadastro enviado com sucesso!"
```

Limpeza: a ficha do João **não aparece no mural público** até ser aprovada pela equipe.

---

## 4. Jornada: como a equipe analisa e aprova

A história da Ana, da Secretaria de Cultura, cuidando das inscrições:

```mermaid
sequenceDiagram
    autonumber
    actor A as Ana (equipe da Cultura)
    participant P as Portaria (login)
    participant S as Site (área da equipe)
    participant C as Central do sistema
    participant B as Almoxarifado (dados)

    A->>P: Entra com usuário e senha
    P-->>A: Libera a entrada
    A->>S: Abre a lista de inscrições
    S->>C: Pede a lista
    C->>B: Busca as fichas
    B-->>C: Devolve as fichas
    C-->>S: Mostra na tela
    S-->>A: Vê os cadastros<br/>(Pendentes, Aprovados, Rejeitados)

    A->>S: Clica em "Aprovar" na ficha do João
    S->>C: Pede para atualizar a ficha
    C->>B: Marca como "Aprovado"
    B-->>C: Confirma a mudança
    C-->>S: Atualiza a tela
    S-->>A: Pronto! O João já aparece no mural público
```

---

## 5. Jornada: a opinião do público (feedback)

A história da Maria, que visitou o site e quer dar sua avaliação:

```mermaid
sequenceDiagram
    autonumber
    actor M as Maria (cidadã)
    participant S as Site
    participant C as Central do sistema
    participant B as Almoxarifado (dados)
    actor A as Ana (equipe da Cultura)

    M->>S: Preenche "Deixe seu feedback"<br/>(nota de 1 a 5 e uma mensagem)
    S->>C: Envia a avaliação
    C->>B: Guarda a avaliação
    B-->>C: Confirma
    C-->>S: Avisa o site
    S-->>M: Mostra "Obrigado pelo seu feedback!"

    A->>S: Abre a área de feedbacks no painel
    S->>C: Pede as avaliações
    C->>B: Busca as avaliações
    B-->>C: Devolve as avaliações
    C-->>S: Mostra na tela
    S-->>A: Lê as opiniões da população
```

---

## 6. O que o sistema guarda

As informações são salvas em duas "gavetas" do almoxarifado:

```mermaid
erDiagram
    FICHA_DO_ARTISTA {
        BIGINT numero "Identificador da ficha"
        TEXT nome "Nome real ou artístico"
        TEXT email "E-mail de contato"
        TEXT telefone "Telefone / WhatsApp"
        TEXT cidade "Cidade (padrão: Bagé)"
        TEXT area "Área artística (música, teatro, artesanato...)"
        TEXT historia "Mini-bio do artista"
        TEXT foto "Endereço da foto"
        TEXT instagram "Perfil no Instagram"
        TEXT site "Site ou portfólio"
        TEXT situacao "Pendente / Aprovado / Rejeitado"
        DATE data_cadastro "Quando a ficha foi criada"
    }

    AVALIACAO {
        BIGINT numero "Identificador da avaliação"
        TEXT nome "Nome de quem avaliou (opcional)"
        TEXT email "E-mail (opcional)"
        TEXT tipo "Elogio, Sugestão, Crítica ou Outro"
        NUMBER nota "Nota de 1 a 5 estrelas"
        TEXT mensagem "Opinião da pessoa"
        DATE data "Quando foi enviada"
    }
```

---

## 7. Como o sistema funciona por dentro

Uma visão simples de como as peças se encaixam na internet:

```mermaid
graph LR
    subgraph Dispositivo["📱 Seu computador ou celular"]
        N[Navegador de internet]
    end

    subgraph Vitrine["Vitrine na internet"]
        SITE[Site que todo mundo vê<br/>mural, inscrição e avaliação]
    end

    subgraph Central["Central de atendimento"]
        SERVIDOR[Parte que processa os pedidos]
    end

    subgraph Arquivo["Almoxarifado de dados"]
        ARQUIVO[Onde tudo fica guardado]
    end

    subgraph Portaria["Portaria de segurança"]
        LOGIN[Controle de entrada<br/>só a equipe entra]
    end

    N -->|"acessa"| SITE
    SITE -->|"faz pedidos"| SERVIDOR
    SITE -->|"entrada da equipe"| LOGIN
    SERVIDOR -->|"guarda e busca dados"| ARQUIVO
```

---

## 8. Mapa do site

As páginas do sistema e como elas se ligam:

```mermaid
flowchart TD
    INICIO["Página inicial 🏠<br/>Mural com os artistas aprovados"]
    CADASTRO["Inscrição do artista ✍️<br/>Formulário em 4 passos"]
    FEEDBACK["Avaliação do público 💬<br/>Opinião sobre a plataforma"]
    LOGIN["Entrada da equipe 🔐<br/>Usuário e senha"]
    PAINEL["Painel da equipe 🗂️<br/>Analisar, aprovar, editar e excluir"]

    INICIO --> CADASTRO
    INICIO --> FEEDBACK
    INICIO --> LOGIN
    LOGIN --> PAINEL
    PAINEL -->|"voltar"| INICIO
```