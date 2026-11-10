# QA visual — cartões de destaque do catálogo
## Ajustes finais da fila administrativa — 10/11/2026

- **Referência:** painel administrativo enviado anteriormente e solicitações de micro-ui desta rodada.
- **Alterações:** sidebar limitada às áreas operacionais; KPIs compactos com valores reais e descrições sem tendência fabricada; drawer ampliado; avatar sobreposto à capa; status amarelo removido; destaque azul para aba ativa; cards mantidos em linha no desktop e responsivos em telas menores.
- **Verificação técnica:** `npm run build` passou; `git diff --check` sem erros. Aviso existente de bundle >500 kB permanece.
- **Comparação visual:** não capturada nesta rodada. A tela administrativa exige login e o preview disponível continua no fluxo de autenticação; tipografia, proporção das colunas e comportamento em viewport ainda aguardam conferência visual autenticada.

final result: blocked

## Polimento da fila administrativa — 10/11/2026

- **Referência:** screenshot do painel enviado na rodada anterior (`codex-clipboard-3dcba51b-e1b6-4237-ab8e-97fc0f7c0e5f.png`) e defeitos descritos pelo usuário nesta rodada; não foi anexada uma nova captura do estado atual.
- **Implementação:** utilitária `.sr-only` local; filtros de pendentes em linha; cards com ações horizontais, padding aumentado e biografia truncada em duas linhas com quebra de palavras; banner e avatar sobrepostos no drawer.
- **Verificação técnica:** `npm run build` passou; `git diff --check` sem erros. O bundle continua emitindo o aviso de chunk >500 kB.
- **Verificação visual:** sem captura renderizada nesta rodada. O painel ainda exige sessão administrativa e a prévia disponível redireciona a `/admin/login`; portanto não comparei o mesmo viewport/estado nem confirmei visualmente a ausência de sobreposições.
- **Estado:** a correção de espaçamento foi aplicada no código, mas a validação visual final aguarda sessão administrativa autorizada.

final result: blocked

## Refação visual do painel administrativo — 10/11/2026

- **Fonte visual:** `C:/Users/matheus/AppData/Local/Temp/codex-clipboard-3dcba51b-e1b6-4237-ab8e-97fc0f7c0e5f.png` (900 × 666 px; mockup com Pendentes ativo e drawer aberto).
- **Implementação:** `frontend/src/pages/Admin/AdminDashboard.tsx` e `.css`; build passou. Screenshot da implementação: não capturado, pois `/admin` redirecionou para `/admin/login` no preview local e não havia sessão autenticada disponível.
- **Viewport e estado:** referência desktop de 900 × 666 px; estado equivalente da implementação não pôde ser aberto. A comparação visual não foi feita porque os estados não correspondem.
- **Fidelidade avaliada por evidência:** fonte analisada; implantação não acessível para comparar tipografia, ritmo/colunas, cores, recorte dos ativos ou cópia renderizada. Os arquivos reais de logo/cidade foram reutilizados, e dados de artistas são dinâmicos.
- **Achados:** [P1] QA visual do painel bloqueado pela barreira de autenticação; requer sessão administrativa controlada para comparar layout e interação. Há também seções sem recurso/API existente no produto (categorias, visão geral de eventos, relatórios, configurações e notas internas), mantidas não funcionais/ausentes em vez de simular persistência.
- **Próximo passo de QA:** abrir `/admin` com uma sessão autorizada e capturar o mesmo viewport/estado; revisar qualquer diferença P0/P1/P2, teclado e console antes de declarar fidelidade.

final result: blocked

## Painel administrativo — 10/11/2026

- **Referência:** screenshots do admin atual e do conceito azul com fila de cadastros pendentes enviados pelo usuário.
- **Implementação:** removido Navbar público em `/admin/*`; reaproveitada a sidebar com logo; tema azul/glass aplicado ao dashboard; aba Pendentes redesenhada com filtros, ordenação, métricas reais e drawer responsivo.
- **Interações:** aprovação/rejeição/edição preservam handlers e API existentes; detalhes usam dados recebidos pelo endpoint administrativo; mídia/documentos continuam delegados à ferramenta de mídia já existente.
- **Limites funcionais:** sem API de notas internas, nenhuma caixa de observações fictícia foi adicionada. A referência inclui seções administrativas que não existem no produto atual e não foram inventadas.
- **Correção após erro reportado:** substituído o ícone `Instagram` não exportado por `Link2`; `npm run build` concluído com sucesso. O build ainda emite o aviso já configurado de bundle >500 kB.
- **QA:** revisão estática do JSX/CSS e diff. Não houve captura em browser, testes automatizados, aprovação/rejeição real, auditoria de teclado/leitor de tela nem cálculo de contraste.

final result: blocked

## Confirmação LGPD no cadastro — 10/11/2026

- **Referência:** solicitação do usuário para tornar obrigatório o aceite na etapa de revisão.
- **Implementação:** `/cadastrar`, checkbox controlado e verificação no handler antes de qualquer POST; texto legal permanece igual.
- **Resultado:** revisão estática do JSX/CSS. O botão final depende do checkbox e os dois caminhos que chamam `handleSubmit` são bloqueados sem aceite.
- **Limite importante:** a confirmação é somente de interface; o campo não integra o payload e o backend não registra nem exige o aceite. Nenhum cadastro foi enviado.
- **QA:** sem captura em navegador, build, testes automatizados, teclado ou leitor de tela. Aceite visual formal bloqueado.

final result: blocked

## Cadastro do artista: identidade visual e LGPD — 10/11/2026

- **Referência:** capturas de etapas Materiais e Mídias e Revisão anexadas pelo usuário.
- **Implementação:** rota `/cadastrar`; tema azul escopado a `.cadastro-page`, tipografia de títulos ajustada e aviso de privacidade com título, negrito, ícone e texto legal preservado.
- **Evidência:** browser local, etapa Dados básicos, viewport móvel aproximado de 435 px. A imagem observada mostra fundo, progresso, etapa ativa e campos em azul, sem corte lateral aparente. Arquivo de captura não foi arquivado.
- **Etapas restantes:** Materiais e Mídias e Revisão foram revisadas no código/CSS, mas não renderizadas nesta rodada; o bloco LGPD maior não foi observado em navegador.
- **Limites:** desktop, build, testes automatizados, teclado, leitor de tela e cálculo de contraste não verificados. Aceite visual formal bloqueado até conferir as outras etapas e a LGPD renderizada.

final result: blocked

## Paleta azul no cadastro do artista — 10/11/2026

- **Referência:** captura anexada pelo usuário nesta conversa.
- **Implementação:** `/cadastrar`; tokens de cor escopados a `.cadastro-page` e subtítulo do header compacto em azul.
- **Resultado:** revisão estática do CSS; não foi feita nova captura visual nesta rodada.
- **Interação e fluxo:** nenhuma lógica, validação ou payload do cadastro foi alterado; nenhum cadastro foi enviado.
- **Limites:** viewport desktop/mobile, build, testes automatizados, teclado, leitor de tela e contraste calculado não foram verificados. Aceite visual formal pendente.

final result: blocked

## Páginas Como Funciona e Feedback — 10/11/2026

- **Referência:** capturas anexadas pelo usuário nesta conversa.
- **Implementação:** rotas `/como-funciona` e `/feedback`; componente compartilhado `PortalPageHero` usa `bage-catalog-hero.webp` e o cabeçalho da home.
- **Resultado:** páginas inspecionadas no browser local em viewport móvel de aproximadamente 435×872 CSS px; o screenshot foi observado, mas não arquivado. Hero/cidade, cabeçalho compacto, sobreposição do cartão e formulário aparecem sem corte lateral visível nesse viewport.
- **Interação:** lupa do cabeçalho navegou de `/feedback` para `/#busca-artistas` e deixou o campo de busca focado. O formulário preserva o POST e as validações existentes; nenhum feedback foi enviado.
- **Limites:** viewport desktop não foi conferido; screenshot não foi arquivado; build, testes automatizados, teclado e leitor de tela não foram verificados. Comparação formal de fidelidade permanece bloqueada por falta de evidência persistida.

final result: blocked

## Cores do menu móvel da home — 10/11/2026

- **Fonte:** captura de referência anexada pelo usuário nesta conversa.
- **Implementação:** home local `http://127.0.0.1:5174/`, viewport de 390×844, drawer aberto.
- **Resultado observado:** ação de login com fundo azul claro e borda azul; cadastro com fundo azul sólido; links, hover e foco adotam azul da home. Navegação administrativa mantém o estilo secundário.
- **Limite:** captura observada no browser, não arquivada em arquivo; sem teste de teclado, console, build ou envio de formulários.

final result: blocked
## Refino responsivo do login administrativo — 10/11/2026

- **Fonte:** imagem de login em duas colunas anexada pelo usuário nesta conversa; arquivo de referência não arquivado no repositório.
- **Implementação:** `/admin/login`, browser in-app em `http://127.0.0.1:5174/admin/login`.
- **Evidência observada:** desktop 1440×900 com overlay azul, texto diretamente sobre a foto e recursos sem caixas; mobile 390×844 com painel esquerdo oculto e card centralizado; 1023 px ocultou a coluna e 1024 px preservou as duas colunas. Medidas computadas indicaram zero overflow horizontal nos quatro viewports.
- **Interação:** sem envio de login ou recuperação de senha.
- **Achados:** nenhuma diferença funcional/responsiva P0/P1/P2 identificada; teclado, leitor de tela e contraste automatizado não foram avaliados. Captura comparativa não foi persistida junto à referência.

final result: blocked

## Login administrativo em duas colunas — 10/11/2026

- **Fonte:** imagem de referência anexada pelo usuário (codex-clipboard-d8dd2a68-9da5-4a83-bd1e-53b8292fc96e.png) e foto image.jpg enviada para o painel; a fonte de referência não está arquivada no repositório.
- **Implementação:** /admin/login, browser in-app em http://127.0.0.1:5174/admin/login; capturas observadas em mobile (página inteira, largura 440 CSS px) e desktop (1440×900, DPR não exposto).
- **Estado:** o navegador preencheu automaticamente credenciais salvas; não foram inspecionadas nem usadas. Nenhum login, redefinição de senha ou transmissão foi acionado.
- **Comparação:** divisão 46/54, título e recursos à esquerda, card e link público à direita; em mobile as colunas empilham. Foto real tem luz diurna diferente da imagem dourada do mock e recebeu overlay para manter contraste. Imagem, tipografia, cores, espaçamento e texto foram comparados visualmente; não houve artefato comparativo persistido nem recorte focal arquivado.
- **Achados:** nenhum P0/P1/P2 visível na conferência. Testes de teclado, leitor de tela, zoom, build e autenticação não executados. O fluxo de recuperação depende da allowlist de redirect no Supabase e não foi enviado.
- **Resultado formal:** captura e comparação conjunta não puderam ser arquivadas neste relatório; aceite visual formal bloqueado por falta desses artefatos.

final result: blocked


**Simplificação do login administrativo — 10/11/2026.** A rota `/admin/login` agora não renderiza o cabeçalho global, o botão Home ou a imagem de Bagé. O cartão central mede 50vw até 920px e ocupa a largura útil em telas menores. A marca/wordmark está dentro do cartão como link para `/`. Na prévia local (~434px), o formulário, a nota e a marca ficaram visíveis e sem corte; a ação de autenticação não foi enviada. Não houve captura desktop, comparação formal ou build. Sem aceite visual completo.

**Login artista/admin e CTA Admin — 10/11/2026.** A referência administrativa foi traduzida para o login do Conselho: contexto, recursos, foto existente de Bagé, formulário e aviso de acesso restrito. Login artista e controles de senha usam azul em vez de roxo, com Inter/Plus Jakarta Sans. O botão Admin foi recolocado nos cabeçalhos com navegação pública; `/admin/login` mantém a marca e não exibe ações de conta. Na conferência local, as duas telas foram abertas no navegador em largura móvel aproximada de 434px; ambas empilharam sem corte na área visível. O formulário não foi enviado. Não houve comparação lado a lado, captura persistida, inspeção desktop ou execução de build; esta nota não representa aceite visual completo.

**Correção da marca e cabeçalho — 10/11/2026.** A entrada recebida era um JPG com padrão quadriculado incorporado (não alfa). A versão consumida no site é um PNG transparente salvo em `frontend/public/cmpcc-logo.png`, preparado pela ferramenta integrada ImageGen para remover somente o fundo quadriculado e manter o emblema. A caixa da imagem permanece nas dimensões CSS anteriores. O CTA “Sou artista” usa azul direto (`#0757df`): a variável do tema era escopada dentro do catálogo e não chegava ao cabeçalho global. Nas rotas de cadastro/login/edição, marca permanece e ações do header somem. O canal alfa foi inspecionado nos quatro cantos; a aplicação e as larguras responsivas não foram recapturadas, então não há aceite visual nesta atualização.

**Atualização de marca/cabeçalho global — 10/11/2026.** O novo arquivo institucional `frontend/public/cmpcc-logo.png` substitui os ícones antigos nos usos de cabeçalho, rodapé, login de artista, login administrativo e painel administrativo. Uma `Navbar` compartilhada foi movida para o nível das rotas, com o link de marca apontando para `/`; a configuração inicial das telas compactas foi refinada na nota “Correção da marca e cabeçalho” acima. A ação “Sair” da edição continua disponível no conteúdo da página. O código foi inspecionado, mas a alteração não foi aberta/recapturada em navegador, e lint/build não foram executados. Portanto, esta nota documenta implementação, não aceite visual.

10/11/2026. Atualização da seção de artistas em destaque conforme as duas referências enviadas. Sem publicação.

**Fonte visual.** Primeira referência: `C:/Users/matheus/AppData/Local/Temp/codex-clipboard-85b56a01-9b2a-4558-b709-473376b121e9.png` (893×381); segunda referência do estado anterior: `C:/Users/matheus/AppData/Local/Temp/codex-clipboard-724657a6-cd76-4444-8766-6e3e572fc018.png` (1168×718).

**Implementação inspecionada.** Home em `http://127.0.0.1:5187/`, navegador in-app, viewport CSS 918×413, DPR 1. Captura emitida na sessão visual desta rodada, mas não persistida em arquivo. A tentativa de abrir a captura como `data:` para salvá-la foi bloqueada pela política do navegador; não foi tentada via outro navegador ou ferramenta. Assim, não há arquivo de comparação conjunta arquivado e este QA fica **bloqueado para aceite visual formal**.

**Estado e resultado observado.** Home no modo inicial, tema claro; captura posicionada na transição do hero para filtros e cartões. Foram observados três registros na fixture local. A grade aceita até cinco cartões e exibiu os três existentes; os dois espaços restantes foram preservados em vez de receber dados/fotos fabricados. “Ver todos os artistas” foi acionado: o título mudou para “Artistas do catálogo”, o contador mostrou três resultados e os cards da grade completa apareceram. Links de perfil mantêm as rotas existentes; favorito mantém a ação existente.

**Iteração da grade completa — 10/11/2026.** Após a primeira captura, o estado “Artistas do catálogo” foi atualizado com os mesmos tons azuis da home. Nova captura visual no navegador in-app (1274×717 pixels): cards com borda/sombra azulada, fundo claro, botões “Ver perfil” azuis claros e badges de categoria distintos por família de cor (Artes Visuais verde, Teatro coral, Música azul no conjunto visível). Os chips de filtro já usavam o azul. O contador, favorito, selo verde e links permaneceram. Não foi salva captura para arquivo; nenhum breakpoint adicional foi inspecionado.

**Ajuste final do rodapé.** Depois da captura acima, apliquei o tom navy/azul e links claros somente ao rodapé da home do catálogo; os demais usos de `Footer` preservam o tema anterior. Esta última alteração foi revisada no código, mas não foi recapturada no navegador nesta rodada.

| Superfície | Avaliação observada |
|---|---|
| Fontes/tipografia | Plus Jakarta Sans nos nomes e Inter na interface, preservadas do site. Hierarquia do título, nomes e textos curtos corresponde à referência; screenshot não arquivado para medição lado a lado. |
| Espaçamento/layout | Cards com foto ~116px e corpo compacto, cinco colunas no desktop e duas até 700px; botões alinhados ao rodapé do cartão. Em viewport 918×413, três registros deixam dois espaços vazios porque a fixture retorna só três artistas. |
| Cores/tokens | Fundo claro azulado, texto navy, ações azul, status verde e badges de categoria por família de cor. Favorito pode aparecer preenchido conforme preferência local persistida. |
| Imagens/assets | Cada card usa a foto pública efetivamente recebida; registros sem foto mantêm o fallback existente. A referência tem cinco fotos, mas a fixture visual contém uma foto e duas ausências. Não foram criadas fotos para artistas. |
| Copy/conteúdo | Nome, área, cidade, bio e rota vêm do catálogo aprovado. “Disponível” continua sendo selo demonstrativo herdado. Métricas fictícias de eventos/avaliação da antiga sidebar foram removidas. |

**Achados.** Na visualização expandida capturada, os componentes roxos apontados foram substituídos: badges de categoria coloridos, cartões com bordas/sombras frias e botão de perfil em azul. O rodapé também recebeu tema navy/azul por escopo, mas essa parte não foi recapturada. A diferença de densidade (3 registros locais contra 12 no screenshot atual do usuário) vem do conteúdo da fixture e não autoriza duplicar artistas. A falta de captura/comparação persistida impede registrar ausência formal de divergências P0/P1/P2; por isso o aceite visual formal continua bloqueado. Console e breakpoint mobile desta atualização não foram conferidos.

**Arquivos e rastreabilidade.** `frontend/src/pages/Portal/Portal.tsx` e `frontend/src/pages/Portal/CatalogLanding.css`. Documentação atualizada em `DOCUMENTACAO_PROJETO.md` e `ACESSIBILIDADE.md`. Requisitos relacionados: RF-04 (apenas aprovados no catálogo), RF-05 (link ao perfil público), RF-06 (busca e filtros preservados) e RNF-01 (layout responsivo). Nenhuma mudança em API, banco, dependências ou testes automatizados; lint/build não foram executados.

final result: blocked

---

# Histórico QA visual — topo do catálogo

10/11/2026. Página inicial do Cadastro Municipal de Artistas, em ambiente local com catálogo fictício. Escopo da referência: navegação, marca, hero, filtros e entrada da seção de resultados. Nenhuma publicação.

**Evidência.** Fonte: `C:/Users/matheus/AppData/Local/Temp/codex-clipboard-05fabbe2-470e-481d-85ba-f1720baf0f57.png` (918×413). Excluída a moldura escura do print (recorte x13, y11, 887×402). Navegador: viewport CSS 893×700, 887px úteis, DPR 1, topo sem interação, tema claro. Implementação recortada em 887×402 sem reescala. Comparações abertas lado a lado com referência à esquerda em [iteração 1](codex/output/catalog-header-evidence/comparison-v1.png) e [comparação final](codex/output/catalog-header-evidence/comparison-final.png). A comparação tem 1774×402 e mantém rótulos e curvas em escala 1:1. Os recortes [desktop amplo](codex/output/catalog-header-evidence/wide-top.png) e [celular](codex/output/catalog-header-evidence/mobile-top.png) complementam a revisão.

**Achados e correções.** Na iteração 1, os filtros quebravam “Mais categorias” para uma segunda linha (P2) e atrasavam o título de resultados para y398. Densidade de texto, largura dos pills e espaçamento corrigidos: faixa única, título em y362 (referência ~y360). A curva superior esquerda perdia definição no clareamento (P2); um véu azul suave restaurou o contraste da borda sem prejudicar o texto. A recaptura confirma a barra, busca e indicadores alinhados e as faixas coloridas legíveis. Não ficou P0/P1/P2 visual no recorte definido.

| Superfície | Avaliação final |
|---|---|
| Tipografia | Plus Jakarta Sans em marca/títulos e Inter na interface, mesmas famílias já usadas no projeto. Peso 800, título navy em duas linhas, segunda com destaque azul. A fonte exata do print não foi fornecida. |
| Espaçamento | Margens de 35px, navegação ~63px, banner de ~238px, campo com ~416px e painel lateral de ~175px no viewport equivalente. A ordem e densidade correspondem à referência. Em celular o conteúdo empilha. |
| Cores | Fundo branco azulado, título navy, ações azuis, vidro claro e círculos azul/verde/laranja/vermelho. Contorno de foco visível. `clip-path: shape()` recorta apenas a imagem; raio simples faz o fallback. |
| Imagens | [Panorama WebP](frontend/public/bage-catalog-hero.webp) e [emblema WebP](frontend/public/brand-bage.webp), produzidos com ImageGen integrado a partir do print e otimizados para o repositório (168 KB e 15,5 KB). Recriações, com diferenças de detalhes arquitetônicos e do traço da marca; não são foto original nem arquivo institucional. |
| Conteúdo | Frase, título, ações e início da seção acompanham o print. Contagens reais da resposta pública; cidades representadas ocupam a linha de eventos do mock, pois o catálogo não expõe total de eventos realizados. Os números da prévia são dados de teste. |

**Prompts de arte.** Panorama: recriar somente a área panorâmica do print, em luz dourada, com arquitetura terracota e creme, torre à direita, palmeiras e telhados, céu azul suave, névoa clara à esquerda e fitas translúcidas amarelas, verdes e azuis no extremo direito; sem texto, logo, UI ou moldura. Emblema: recriar apenas o símbolo circular superior esquerdo, arco multicolorido, interior branco com coroa mural laranja e colinas verdes, acabamento plano, sem texto, exterior transparente.

**Verificação.** [Resultados no navegador](codex/output/catalog-header-evidence/browser-results.json): lupa focou a busca; Enter levou foco ao título de resultados; Artes Cênicas mostrou Teatro na fixture; “Mais categorias” mostrou filtros adicionais e sinalizou Teatro ainda ativo após fechar; “Ver todos” limpou busca e filtro; login/cadastro abriram as rotas corretas. Menu móvel aberto com Enter e fechado com Escape, retornando foco e mantendo acesso admin. Sem overflow horizontal a 320, 390, 768, 1024 e 1440px; imagens carregadas nas cinco larguras; console final sem erros ou avisos. Desktop admin segue disponível no rodapé. Não houve auditoria integral de leitor de tela ou produção.

**Arquivos e testes.** Implementação em `frontend/src/components/Navbar.tsx`, `frontend/src/pages/Portal/Portal.tsx`, `frontend/src/pages/Portal/CatalogLanding.css` e `frontend/src/lib/catalogFilter.ts`. Assets e evidências acima; documentação atualizada em `DOCUMENTACAO_PROJETO.md` e `ACESSIBILIDADE.md`. O novo caso de categoria agregada está em `frontend/test/quality.test.mjs` (RF-06, CT-RF06-03/05); catálogo público (RF-04) e reflow (RNF-01) conferidos em navegador com API local. Lint, typecheck, 26 testes frontend, build e `git diff --check` passaram. Build conserva aviso do chunk inicial acima de 500 kB. Sem alteração de API, banco ou dependências.

final result: passed

---

## Histórico — perfil público do artista (23/10/2026)

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

