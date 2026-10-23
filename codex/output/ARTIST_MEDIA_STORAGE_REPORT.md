# Mídias do artista — Storage real

23/10/2026. Implementação local testada; bucket e migrations ainda não aplicados remotamente. A-08 avança para **parcial implementado**, sem encerramento.

## Arquitetura

Browser envia multipart ao NestJS; backend valida todos os arquivos antes de criar Auth/ficha. Metadados ficam em `artist_media`; bytes no bucket privado `artist-media`. Browser não recebe Secret, path administrativo ou acesso direto ao bucket. API pública verifica artista Aprovado a cada leitura de arquivo e devolve bytes; admin autenticado pode conferir pendentes/rejeitados por endpoint separado. Desaprovação mantém material e agenda, retirando acesso público em novas requisições. Arquivos já baixados não podem ser revogados do dispositivo de terceiros.

Paths: `artistas/{id-numérico}/{UUID}.webp`, `{UUID}-thumb.webp` ou `{UUID}.pdf`. Nome original é saneado e usado apenas para exibição; nunca contém CPF/e-mail/nome pessoal no path. URL pública é relativa à API e contém UUID da mídia, não a URL do Storage.

## Tipos, limites e validação

| Material | Quantidade por artista | Entrada e validação | Persistência |
|---|---:|---|---|
| Foto | 1 | JPEG/PNG/WebP estático; extensão + MIME declarado + formato real; até 10 MB | WebP reprocessado, até 1920 px, miniatura até 480 px |
| Galeria | 8 | Mesmas regras; até 8000 px por lado e 40 milhões de pixels | WebP e thumbnail individuais |
| Portfólio | 1 | PDF, até 10 MB, assinatura `%PDF-`, parser estrutural, ao menos uma página; sem senha | Bytes PDF privados e metadados reais |
| Vídeo/áudio | — | Adiados; controles falsos removidos do cadastro ativo | Não implementado |

10 MB = 10 × 1024 × 1024 bytes, conforme requisito de arquivo. Quantidades, dimensões e redução são decisões técnicas de proteção/primeira versão, não novos requisitos oficiais retroativos. Formatos DOC/DOCX, SVG, HTML, GIF e imagens animadas não são aceitos. O limite multipart é 10 arquivos por lote; validação de quantidade também ocorre na RPC com lock do artista, protegendo concorrência.

Sharp decodifica/reprocessa imagem, aplica orientação e não mantém metadados de entrada. PDF é carregado por pdf-lib; inspeção rejeita JavaScript, ações automáticas, anexos, XFA, rich media e ações de execução/envio/links remotos de ação. Isso é defesa complementar, **não antivírus nem garantia de documento inofensivo**. Referências: [entrada Sharp](https://sharp.pixelplumbing.com/api-input/), [saída Sharp](https://sharp.pixelplumbing.com/api-output/), [PDFDocument](https://pdf-lib.js.org/docs/api/classes/pdfdocument).

## PDF público e revisão administrativa

Botões só existem com metadata persistida e arquivo vinculado. GET retorna `nosniff`, `no-store`, nome fixo seguro e CSP sandbox/default-src none. Essa CSP impede visualização nativa em alguns navegadores; a UI usa PDF.js carregado sob demanda, canvas de uma página por vez, sem scripting manager ou camada de links/anotações executáveis. Há paginação, download, texto extraído, loading/erro, Escape e foco contido/restaurado. Admin busca bytes com Authorization e usa o mesmo visualizador; não abre URL pública de mídia pendente.

O download é alternativa para PDF não renderizado. PDFs complexos podem exigir recursos adicionais de fontes/CMaps do PDF.js e precisam de homologação; o fixture básico renderizou a 320px. Não se declara acessibilidade total do conteúdo de PDFs enviados pelo artista. [PDF.js](https://mozilla.github.io/pdf.js/getting_started/) e [API](https://mozilla.github.io/pdf.js/api/draft/api.js.html).

## Policies e migrations

`20261023_artist_profile.sql`: cinco tabelas com RLS, grants somente service_role, funções de anexação/exclusão/visita executáveis só por service_role. `20261023_artist_storage.sql`: bucket privado de 10 MB e policy RESTRICTIVE para negar browser nesse bucket. Sem liberação direta de CRUD anon/authenticated, sem alterar grants/policies das tabelas antigas e sem executar bootstrap. [Buckets privados Supabase](https://supabase.com/docs/guides/storage/buckets/fundamentals).

A política no SQL não é prova de que o ambiente hospedado a aplica. Inspeção de grants/policies e testes negativos de Data API/Storage reais permanecem BLOQUEADOS até aplicação humana e contas controladas. Ordem exata no [checklist](ARTIST_PROFILE_DEPLOY_CHECKLIST.md).

## Consistência e cleanup

Não há transação única entre Auth, Postgres e Storage. O cadastro salva ficha/Auth existentes e tenta anexar mídias; falha nessa fase mantém ficha e retorna `media_upload: pending`, informando ao usuário que não deve cadastrar novamente.

A fila durável `artist_media_cleanup` nasce **antes** de upload/exclusão. Em anexação, paths ainda referenciados são preservados; objetos não vinculados são removidos. Em exclusão de mídia ou artista, metadados saem por RPC/cascata e a remoção no Storage é tentada; falha deixa job para retry, sem apagar objetos de outro artista. Excluir artista também elimina agenda/estatísticas/sessões por FK. Rejeitar/desaprovar não faz cleanup destrutivo.

`POST /artistas/manutencao/limpeza-midias`, admin: até 100 jobs com idade superior a 30 minutos, verifica referências antes de remover, conserva job se houver falha e poda hashes antigos de visitas. Agendamento/monitoramento é tarefa operacional pendente; não há cron instalado automaticamente. A fila não guarda CPF/e-mail/senha, só paths seguros. Risco de interrupções e permissões incorretas exige smoke real.

## Compatibilidade e desempenho

Novos uploads de foto são Storage; `foto_url` guarda endpoint relativo, não Base64 novo. DataURLs JPEG/PNG/WebP antigos e URL externa válida continuam renderizando; nenhum backfill automático. Registros sem mídia/eventos têm estados vazios. Catálogo busca thumbs; galeria usa thumbs/lazy e só abre imagem maior no lightbox. PDF.js é lazy: chunk 433,30 kB / gzip 130,36 kB, worker separado; não entra na carga inicial do perfil. Chunk inicial existente passou a 559,73 kB / gzip 158,29 kB, mantendo warning >500 kB. Medição é build local, sem promessa de Core Web Vitals remoto.

## Evidência

39 novos cenários E2E no arquivo de perfil, integrados aos 115 E2E totais: bytes válidos, MIME falso, extensão inválida, vazio, PDF exatamente 10 MB e acima, PDF ativo, dimensões/formato, quantidade, UUID/path traversal, acesso de artista errado/privado, falha de upload, falha/retry de cleanup, cascata, preservação de outros artistas e guards. Store é fake em memória; asserções não executam SQL/Storage remoto.

Navegador: cadastro multipart com foto/galeria/PDF, leitura admin pendente, PDF privado, publicação após aprovação, galeria pública e PDF a 320px. Fixture `SMOKE_TEST_` somente em memória, sem conta/e-mail real. Logs, `browser-results.json` e imagens em `artist-profile-evidence/`. Audits `--omit=dev`: zero vulnerabilidades de produção nas duas árvores; atualização compatível de dependências backend preservou NestJS 11. Sem `npm audit fix --force`.
