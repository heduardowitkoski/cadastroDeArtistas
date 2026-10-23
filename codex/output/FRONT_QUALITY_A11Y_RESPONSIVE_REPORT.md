# Qualidade do front, acessibilidade e responsividade — 23/10/2026

**Resultado: PARCIAL para WCAG 2.1 AA; verificações locais descritas passaram.** Não se declara conformidade integral. Identidade roxa e estrutura existentes preservadas; somente contraste semântico, navegação, legibilidade e reflow foram ajustados. Não houve redesign, carrossel, nova página de perfil ou mudança de favoritos.

## Tipografia e CSS

Auditados **9 CSS**, 270 declarações antes e 273 depois, nas propriedades font-size/font-weight/line-height/letter-spacing/text-transform. Inclui CSS legado; declaração não equivale a elemento efetivamente renderizado. Inventários completos: [antes](front-quality-evidence/typography-before.json), [depois](front-quality-evidence/typography-after.json), [24 media queries](front-quality-evidence/media-queries.json). Seletores aninhados são localizados também pela linha para evitar ambiguidade da extração estática.

| Tamanho literal | Antes | Depois |
|---|---|---|
|11px|14|8|
|12px|30|4|
|13px|42|60|

Body 16px; inputs 16px pelo estilo comum; labels 14px; ações principais 14px; helpers prioritários 13px. Foram aumentados auxiliares do wizard, descrição, erros, upload e ações administrativas. Nomes de arquivo 11→13 e aviso sobre conta 12→13. Pesos 600/700 e line-height 1.6/1.7 existentes preservados conforme contexto; uppercase restrito a labels/status/trechos existentes. Não foi imposta proibição geral de 11/12px: WCAG não determina um mínimo universal em pixels.

Exceções compactas restantes:

| Arquivo / linha | Seletor | Tamanho | Contexto |
|---|---|---|---|
| frontend/src/index.css:123 | .badge | 11px | Selo/contador compacto; texto identificável, sem usar só cor; reavaliar com zoom/leitor |
| frontend/src/pages/Admin/AdminDashboard.css:58 | .nav-count | 11px | Selo/contador compacto; texto identificável, sem usar só cor; reavaliar com zoom/leitor |
| frontend/src/pages/Admin/AdminDashboard.css:193 | .chart-count | 12px | Selo/contador compacto; texto identificável, sem usar só cor; reavaliar com zoom/leitor |
| frontend/src/pages/Admin/AdminDashboard.css:264 | .artista-tags-mini | 11px | Selo/contador compacto; texto identificável, sem usar só cor; reavaliar com zoom/leitor |
| frontend/src/pages/Cadastro/Cadastro.css:450 | .preview-cat | 11px | Selo/contador compacto; texto identificável, sem usar só cor; reavaliar com zoom/leitor |
| frontend/src/pages/Cadastro/Cadastro.css:461 | .preview-avail span | 11px | Selo/contador compacto; texto identificável, sem usar só cor; reavaliar com zoom/leitor |
| frontend/src/pages/Portal/Portal.css:81 | .hero-badge | 12px | Selo/contador compacto; texto identificável, sem usar só cor; reavaliar com zoom/leitor |
| frontend/src/pages/Portal/Portal.css:262 | .artist-status-badge | 11px | Selo/contador compacto; texto identificável, sem usar só cor; reavaliar com zoom/leitor |
| frontend/src/pages/Portal/Portal.css:284 | .artist-cat-badge | 11px | Selo/contador compacto; texto identificável, sem usar só cor; reavaliar com zoom/leitor |
| frontend/src/pages/Portal/Portal.css:353 | .featured-badge | 11px | Selo/contador compacto; texto identificável, sem usar só cor; reavaliar com zoom/leitor |
| frontend/src/pages/Portal/Portal.css:513 | .modal-tag | 12px | Selo/contador compacto; texto identificável, sem usar só cor; reavaliar com zoom/leitor |
| frontend/src/pages/Portal/Portal.css:518 | .modal-avail | 12px | Selo/contador compacto; texto identificável, sem usar só cor; reavaliar com zoom/leitor |


## Contraste

Fórmula de luminância relativa sRGB; texto normal ≥ 4.5:1, grande ≥ 3:1, borda/controle relevante ≥ 3:1. Coleta DOM de texto visível em sete rotas, backgrounds alfa compostos com ancestrais, combinações deduplicadas por página. [contrast-final.json](front-quality-evidence/contrast-final.json): **91 combinações,58 sem imagem/gradiente sem falha numérica,33 com imagem/gradiente não aprovadas automaticamente**. Peso/tamanho computados determinam o limite. Estados hover/focus/disabled, pseudo-elementos e todos os passos do formulário não foram exaustivamente coletados.

| Uso | Cores | Razão |
|---|---|---|
| Texto secundário | #4B5563 / #FFFFFF | 7.56:1 |
| Muted final / fundo secundário | #626B7A / #F1EFFE | 4.74:1 |
| Muted anterior / fundo secundário | #6B7280 / #F1EFFE | 4.26:1 |
| Roxo primário / branco | #7C3AED / #FFFFFF | 5.70:1 |
| Branco / verde final | #FFFFFF / #047857 | 5.48:1 |
| Branco / verde anterior | #FFFFFF / #10B981 | 2.54:1 |
| Erro final / branco | #B91C1C / #FFFFFF | 6.47:1 |
| Erro anterior / branco | #EF4444 / #FFFFFF | 3.76:1 |
| CTA branco / laranja final | #FFFFFF / #C2410C | 5.18:1 |
| CTA branco / laranja anterior | #FFFFFF / #F97316 | 2.80:1 |
| Borda input / branco | #8B7AA9 / #FFFFFF | 3.85:1 |
| Borda input / fundo secundário | #8B7AA9 / #F1EFFE | 3.39:1 |


Muted anterior falhava no fundo #F1EFFE; verde com branco, erro vermelho em texto pequeno e CTA laranja com branco também exigiam ajuste. Tokens semânticos escurecidos, sem trocar o roxo institucional. Placeholders usam muted opaco. Borda de input escurecida para #8B7AA9; foco roxo contornado. Linhas/cards decorativos claros não são a única identificação de campo/controle. Sidebar mantém texto claro em roxo escuro; screenshot e coleta DOM incluídos.

Hero tem foto e overlay: inspeção visual preserva texto claro, mas média de pixels ou fundo ancestral não prova contraste do pior pixel. Esse trecho e badges/gradientes translúcidos exigem medição de pixels/estados em navegador completo antes de afirmar AA integral. Controles desabilitados têm tratamento de exceção, não são apresentados como falhas aprovadas.

## Teclado, foco, semântica e mensagens

| Verificação | Evidência / resultado |
|---|---|
|Mostrar/ocultar senha nos dois logins|Enter/Space alternam text/password; current-password preservado; type=button; sem submissão acidental; aria-label/pressed/controls; alvo 44px|
|Home e sessão|Link nativo para /; não lê nem apaga storage/Auth. Admin Home→/admin sem login; artista Home→área sem login, em Auth simulado. Logout distinto encerra e bloqueia painel|
|Perfil público|CTA button nativo dentro de article, sem rolebutton envolvendo favorito. Enter/Space abrem; foco no fechar; Shift+Tab→telefone; Tab→fechar; Escape fecha e devolve foco; body scroll restaurado|
|Editor admin|Foco inicial no fechar; ciclo até Salvar; Escape devolve Editar; scroll interno; fechar 44px; não salva ao fechar|
|Excluir artista/feedback|Confirmação começa em Cancelar; cancelamento preservou as duas fixtures; exclusão real somente nos testes em memória|
|Menus mobile|Enter abre; Escape fecha e devolve foco ao acionador; admin conserva sua contenção de foco|
|Formulário|Labels/ids, obrigatórios, aria-invalid/describedby; primeira falha em cad-nome; mínimo bio anunciado e foco em cad-bio; upload acionável por botões nativos|
|Estados|Loading, vazio e erro distintos no catálogo; feedback de erro preserva texto e reabilita envio; sucesso simulado no mock|
|Landmarks/headings|main nas páginas públicas/logins; dashboard h1; navegações nomeadas; decorativos selecionados ocultos; idioma pt-BR existente|
|Movimento|prefers-reduced-motion reduz animação/transição e desliga scroll suave; inspeção de CSS, sem simulação assistiva completa|

Provas: [browser-results.json](front-quality-evidence/browser-results.json), [modal público320](front-quality-evidence/public-modal-320.png), [editor320](front-quality-evidence/admin-modal-320.png). Verificações são técnicas, não sessão com NVDA/VoiceOver. Texto/labels presentes no DOM não comprovam anúncio por leitor. Página de sucesso do cadastro e todos os elementos legados ainda exigem percurso assistivo completo. Os selos usam texto além da cor; imagens reais usam alt com nome.

## Reflow e responsividade

As40 combinações abaixo foram executadas com captura de tela e clientWidth/scrollWidth; nenhum overflow horizontal ao final. A largura útil pode ser6px menor devido scrollbar. Dados de admin/artista são locais simulados. A rota/admin é autenticada no teste; /artista/editar exibe a indisponibilidade vigente.

| Rota |320|375|768|1024|1440|
|---|---|---|---|---|---|
| `/` |PASSOU|PASSOU|PASSOU|PASSOU|PASSOU|
| `/cadastrar` |PASSOU|PASSOU|PASSOU|PASSOU|PASSOU|
| `/como-funciona` |PASSOU|PASSOU|PASSOU|PASSOU|PASSOU|
| `/feedback` |PASSOU|PASSOU|PASSOU|PASSOU|PASSOU|
| `/artista/login` |PASSOU|PASSOU|PASSOU|PASSOU|PASSOU|
| `/artista/editar` |PASSOU|PASSOU|PASSOU|PASSOU|PASSOU|
| `/admin/login` |PASSOU|PASSOU|PASSOU|PASSOU|PASSOU|
| `/admin` |PASSOU|PASSOU|PASSOU|PASSOU|PASSOU|


Correções: min-width0/width100% na área indisponível, quebra de heading a 320; grids minmax0 e mínimos limitados a 100%; header e steps sem colisão; Home visível em mobile; estrelas de feedback44px com quebra; modal público com max-height baseado emdvh; posição do fechar admin isolada contra CSS global do Portal.

Adicionais: etapas 2/3/4 do wizard a 320px sem overflow; etapas usam rolagem vertical normal e ações alcançáveis. Modais público/admin conferidos a 320×812 com conteúdo interno rolável. Paisagem simulada812×375 em catálogo/cadastro/login admin sem overflow horizontal; não houve rotação física. As24 media queries foram inventariadas e as correções reutilizaram os limites existentes de 480/640/768/1024/1100; prefers-reduced-motion é preferência, não breakpoint visual aleatório.

**Zoom200%: BLOQUEADO.** O IAB aceitou teclasCtrl++ mas não alterou dimensões/escala observável, portanto não se marcou como executado. Reflow320px não substitui zoom real. Validar Ctrl+200% em Chrome/Edge e teclado/leitor no ambiente final.

## Pendências e riscos

RNF-01 parcialmente comprovado; RNF-04 exige usuários reais. Sem axe/Lighthouse/validação com NVDA nesta execução; não se alega auditoria automatizada de acessibilidade só por existir Node:test. Hero/gradientes e estados adicionais, zoom, leitores e dispositivos físicos continuam pendentes. Ordenar, termos/privacidade, selo Disponível e favoritos demonstrativos existentes permanecem A-18/C-05/C-06. Clareza funcional corrigida emComo funciona: autoedição não é mais prometida como disponível. A-12/A-13/A-17 avançam, sem fechamento indevido.
