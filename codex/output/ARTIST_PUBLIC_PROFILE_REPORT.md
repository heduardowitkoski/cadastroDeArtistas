# Perfil público completo — implementação e validação

23/10/2026. Rota **`/artistas/:id`** implementada. Slug futuro avaliado e adiado: ID já garante link único/compartilhável sem introduzir resolução/redirecionamentos adicionais. Local: `http://127.0.0.1:5187/artistas/1`, com fixture sintético e API isolada em memória. Não representa dados de produção.

## Navegação, layout e dados

Catálogo e destaque lateral agora usam links para a página; modal público descontinuado. Navbar/Footer existentes preservados. Hero com foto ampliada/overlay escuro/avatar, nome, categoria, cidade e ações reais. Sem foto, ícone de pessoa; sem dados de contato, ações correspondentes são omitidas. A bio completa aparece em Sobre; introdução longa é truncada visualmente no hero.

Âncoras `#visao-geral`, `#portfolio`, `#sobre`, `#agenda`, `#contato` com seleção atual e scroll respeitando reduced motion. Grid principal contém Sobre, atuação/disponibilidade reais, galeria/PDF, agenda, detalhes; coluna lateral contém resumo, contato e cidade/mapa. Foto/biografia/categoria não foram copiadas do artista da referência: QA usa fixture identificado com imagem existente de Bagé, repetida na galeria só para validar oito arquivos distintos. Nada disso é inserido no Supabase real.

O backend usa allowlist existente, adicionando apenas `member_since` derivado de `created_at`, `views`, mídias públicas e eventos públicos futuros. Não expõe CPF/CNPJ, e-mail, UID, status administrativo, objeto Auth, timestamp bruto ou path de Storage. Artista inexistente, Pendente ou Rejeitado retorna 404 equivalente antes de consultar mídias. Falha de infraestrutura retorna 503 e UI com retry. O título do documento usa nome artístico/nome; não há SSR prometido.

## Funcionalidades reais

| Recurso | Comportamento implementado |
|---|---|
| Galeria | Até 8 imagens; thumbnails, lazy loading; primeiro tile grande e miniaturas; botão mostra total real; lightbox com setas/botões/Tab/Escape e retorno do foco |
| PDF | Nome/tipo/tamanho reais; visualizar em canvas com páginas/texto extraído; baixar via API; nenhum botão se não existe arquivo persistido |
| Favoritos | localStorage por navegador, sincronizado com catálogo e entre abas; limite defensivo 1000 IDs; storage indisponível avisa e mantém estado só na visita; sem contador global inventado |
| Visualizações | POST no backend com UUID de sessionStorage; SHA256 por artista/sessão, incremento atômico/deduplicado em RPC; sem fingerprint/IP persistido; limite de requests em memória; sem sessionStorage não registra repetidamente |
| Membro desde | Data derivada de cadastro real e formatada pt-BR; não inventada para legado sem data |
| Compartilhamento | Opções copiar link e Web Share se suportado; clipboard com status acessível, fallback textual se indisponível; URL canônica por ID |
| Contato | Telefone público `tel:`, Instagram normalizado e site HTTP(S), sem credenciais na URL; e-mail omitido por não integrar contrato público |
| Localização | Cidade pública e busca externa Google Maps; sem endereço privado, coordenadas, chave de API, biblioteca de mapa ou embed rastreador |
| Agenda | Eventos futuros e públicos ordenados crescentemente; data/hora de Brasília, local, cidade e link seguro opcional; estado vazio explícito |
| Administração | Drawer próprio de mídias e agenda por artista; review de pendente, upload/exclusão e CRUD de eventos; apenas admin validado no servidor |

Vídeo e áudio não implementados; controles falsos foram removidos do cadastro ativo. Autoedição/ownership não habilitados. Formulário mantém o fluxo existente; passo de mídias agora envia arquivos reais. Rascunho/C-03/C-04 e demais dívidas antigas não foram tratadas como autorização adicional.

## Inventário de API e integração

Prefixo `/artistas`. Admin = token validado pelo guard existente e papel confiável em `app_metadata`, não por campo enviado pelo cliente.

| Método e path | Auth/papel | DTO/entrada | Resposta principal / RF-CT relacionado |
|---|---|---|---|
| GET `/:id` | Público, aprovado | ID inteiro | 200 perfil allowlist; 404 equivalente; 503; RF05/CTs perfil auxiliares |
| POST `/:id/visualizacoes` | Público, aprovado e rate limit | Somente session_id UUIDv4 | 201 `{views}`; 400/404/429/503; visita auxiliar |
| GET `/:id/arquivos/:mediaId` | Público, aprovado | ID, UUIDv4, thumbnail/download | 200 bytes seguros; 404/503; RF03/05 |
| POST `/com-midias` | Público, rate/concurrency limit | Multipart dados JSON CreateArtistaDto + photo/gallery/portfolio | 201 Pendente + email_verification e media_upload saved/pending; 400/409/413/429/503; RF01/02/03 |
| GET `/:id/midias` | Admin | ID | 200 metadata para review; 401/403/404/503; RF03/07 |
| GET `/:id/midias/:mediaId/conteudo` | Admin | ID, UUIDv4 | 200 bytes privados; 401/403/404/503; RF03/07 |
| POST `/:id/midias` | Admin | Multipart arquivos, sem campos extras | 201 anexos; 400/401/403/413/503; RF03/07 |
| DELETE `/:id/midias/:mediaId` | Admin | ID, UUIDv4 | 200 remoção/cleanup_pending; 401/403/404/503; RF03/07 |
| GET `/:id/eventos` | Admin | ID | 200 eventos administrativos; 401/403/404/503; agenda nova |
| POST `/:id/eventos` | Admin | ArtistEventDto | 201 evento; 400/401/403/404/503; agenda nova |
| PUT `/:id/eventos/:eventId` | Admin | UUIDv4 e ArtistEventDto | 200 evento; 400/401/403/404/503; agenda nova |
| DELETE `/:id/eventos/:eventId` | Admin | UUIDv4 | 200; 401/403/404/503; agenda nova |
| POST `/manutencao/limpeza-midias` | Admin | Sem dados necessários | 201 resumo de jobs; 401/403/503; manutenção nova |

CreateArtistaDto é o contrato já usado no JSON. Form multipart passa validação server-side de whitelist antes de Auth. ArtistEventDto valida título 2..160, descrição até 2000, ISO com timezone explícito, local 2..200, cidade 2..120, link HTTP(S) opcional e is_public booleano. Datas são persistidas timestamptz; público não recebe artist_id/created_at interno do evento. Métodos de cadastro JSON/CRUD/status antigos continuam existentes e testados.

## Responsividade e acessibilidade

No navegador: 320/375/768/1024/1440, sem overflow horizontal; largura útil desconta scrollbar de 6px. Hero vertical e ações quebráveis no mobile, cards empilhados e galeria adaptável. Drawer admin mediu 300px em viewport 320px. PDF renderizou canvas 228×323 a 320px.

Teclado validado: lightbox com setas, extremos Tab/Shift+Tab, Escape e foco no acionador; PDF público e privado, Escape aninhado sem fechar drawer pai; fechamento do drawer restaura foco após recarregar lista; compartilhamento retorna foco e anuncia status. Headings/landmarks/labels/alt/reduced motion estão implementados. WCAG 2.1 AA continua alvo, **sem certificação**: NVDA/VoiceOver, zoom real 200%, contraste sobre todas as fotos reais e PDF de terceiros exigem auditoria/homologação. Botões reais/links reais, sem controles decorativos que prometam serviço inexistente.

## Testes e limites

**148 testes passaram**: 115 E2E backend, 8 unitários backend e 25 frontend; 49 novos frente aos 99 anteriores. Todos os gates solicitados passaram, ESLint backend sem --fix. UI comprovou upload cadastral, review pendente, aprovação, CRUD de agenda, favoritos, refresh, visita deduplicada, clipboard, lightbox, PDF e recuperação de 503 por retry; console final sem erros/avisos capturados. Web Share do sistema não foi concluído pelo browser automatizado; copiar link foi.

Migrations, negação direta de Storage/Data API e atomicidade PostgreSQL reais não foram executadas; dependem do checklist humano. Contas controladas não disponíveis; login após confirmação/redirect continuam pendentes. Matriz de 122 CTs oficiais preservada com seus limites, sem transformar cenários auxiliares novos em CTs oficiais aprovados.

QA visual: [design-qa.md](../../design-qa.md), comparação lado a lado e capturas em `artist-profile-evidence/`. A referência orienta composição; diferenças intencionais são header atual, dados reais em vez de estatísticas fictícias, contato público sem e-mail, mapa por cidade e inclusão de PDF/agenda funcionais.
