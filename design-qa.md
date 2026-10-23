# QA visual — perfil público do artista

23/10/2026. Escopo: composição da imagem indicada pelo usuário, preservando identidade e header atuais conforme o prompt. Nenhuma alteração remota.

## Evidência e normalização

- Fonte: `C:/Users/matheus/AppData/Local/Temp/codex-clipboard-82ce8dcd-f407-4a4d-828f-45309764c265.png`, 1448×1086 pixels.
- Implementação: `codex/output/artist-profile-evidence/profile-final-full.png`, 1442×1794 pixels, capturada no browser a partir do topo; recorte superior sem redimensionar em `profile-final-top.png`, 1442×1086.
- Viewport CSS: 1448×1086, área útil 1442px por scrollbar de 6px; densidade do conteúdo 1 pixel por CSS px. A fonte foi recortada em 6px à direita, sem esticar imagens.
- Comparação conjunta efetivamente aberta: `codex/output/artist-profile-evidence/comparison-final.png`, 2884×1086. Fonte à esquerda e implementação à direita. Região legível de hero/tipografia/ações: `comparison-hero.png`, 1500×400, recortes equivalentes sem escala.
- Estado: perfil aprovado, desktop, tema claro, oito imagens; implementação favoritada depois do teste de persistência e breadcrumb com foco visível. Conteúdo da fixture `Arte do Pampa` substitui dados pessoais da referência. Imagens de Bagé repetidas são bytes de teste distintos em Storage simulado, não portfólio publicado/inventado para artista real.
- Capturas mobile/full page: `profile-320.png`, `profile-375.png`, `profile-768.png`, `profile-1024.png`, `profile-1440.png`; PDF em `pdf-preview-320.png`, drawer em `admin-agenda-320.png`.

## Histórico de comparação e correção

1. Primeira iteração: P2 de proporção/altura de hero e ritmo vertical; P2 de composição da galeria. Corrigidos no CSS: hero desktop com 270px, margens de 60px no frame amplo, avatar ~150px, grid principal 2,4:1 e galeria de cinco colunas com primeiro tile ocupando 2×2 e seis miniaturas. Evidência posterior é a captura final acima.
2. Capturas intermediárias `profile-desktop-v1/v2` e comparações v1/v2 tinham corte/densidade incompatíveis; **não usadas para aceite**. Full page intermediário com header sticky deslocado por scroll também não é evidência de defeito da página. A captura final parte de scrollY=0 e tem header no topo. Novas tentativas redundantes de screenshot clip/fullPage falharam na ferramenta; a captura final já existente abriu corretamente e foi usada na comparação conjunta.
3. Comparação final: hero da implementação x60/y~107, altura270, frame1322; referência x~60/y~105, altura~265. Sobre/atuação/disponibilidade, coluna lateral e mosaico mantêm hierarquia e proporções próximas. PDF e agenda reais acrescentam altura abaixo da galeria, conforme escopo funcional autorizado.

## Superfícies obrigatórias

| Superfície | Avaliação final |
|---|---|
| Fontes/tipografia | Inter/fallback do projeto preservados; nome em peso forte e hierarquia de headings semelhante; UI 14..16px e textos secundários legíveis. Bio longa aparece completa em Sobre e reduzida no hero. Recorte de hero confirma leitura das ações. |
| Espaçamento/layout | Hero/avatar/ações, âncoras, cards arredondados, grid lateral e mosaico seguem composição. Mobile empilha sem overflow em cinco larguras testadas. Nenhum controle persistente fica escondido. |
| Cores/tokens | Roxo primário e fundo claro do site preservados; overlay escuro, cards brancos, badges verdes derivados de dados, foco roxo visível. Não foi feito redesign azul a partir de referências antigas. |
| Imagens/assets | Foto do artista efetiva serve ao hero/avatar; thumbnails reais do backend, ícones da biblioteca já usada. Foto de referência não copiada como se fosse registro do projeto. Fixture visual é explícita e isolada; página real usa mídia real cadastrada. |
| Texto/conteúdo | Rótulos em português e dados do contrato; sem e-mail privado, número fictício de favoritos, mapa/endereço inventado ou datas inventadas. Estados vazios reais substituem botões de recursos ausentes. |

## Findings

Nenhum P0/P1/P2 visual acionável permanece no escopo contratado. Diferenças aceitas por requisitos: header atual com Feedback/Admin em vez de novos links inertes e busca global; favoritos locais sem contador global; cidade com link externo em vez de mapa embutido; PDF/agenda funcionais; dados e imagens da fixture diferentes dos dados pessoais mostrados no exemplo.

## Interações, console e limites

`browser-results.json`: catálogo/destaque → rota, refresh, favorito persistido, visita deduplicada, copiar link com status, 404 equivalente, estados vazios, lightbox (setas/Tab/Escape/foco), PDF público/privado no mobile, cadastro com arquivos, revisão/aprovação e CRUD de agenda admin. Falha de API exibiu retry; restauração do serviço e clique recuperaram perfil. Console final capturado: `[]` para error/warn.

Reflow 320/375/768/1024/1440: scrollWidth igual a clientWidth. Nenhuma prova de aceite remoto. NVDA/VoiceOver, zoom real 200%, share nativo do sistema e contraste com todas as fotos futuras não foram homologados; não se declara WCAG integral. PDF de terceiros pode ter conteúdo inacessível apesar da UI oferecer texto extraído.

## Checklist de implementação

- [x] Corrigir proporções do hero e mosaico.
- [x] Abrir fonte e captura juntas, normalizadas, e recorte detalhado.
- [x] Conferir tipografia, espaçamento, cores, imagens e conteúdo.
- [x] Conferir interações e reflow no browser e manter preview local.
- [ ] Homologar banco/Storage/Auth publicados conforme checklist, separadamente do aceite visual local.

## Follow-up polish

P3: reavaliar cortes do hero com diferentes proporções de fotos de artistas e imagens de portfólio variadas na homologação; não exige criação de fotos fictícias para produção.

final result: passed
