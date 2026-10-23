# Uploads e carrossel — avaliação de 23/10/2026

**Foto parcialmente funcional por DataURL; galeria/vídeo/áudio/documento NÃO IMPLEMENTADOS na persistência.** Não foi criado bucket, policy, migration, endpoint binário ou carrossel.

## Fluxo real das mídias

| Mídia | UI e estado | Payload/API/banco | Resultado |
|---|---|---|---|
|Foto principal|input type=file→FileReader→Image→canvas; largura máxima 800px, JPEG quality 0.6; fallback DataURL original em erro|foto_url entra no JSON e coluna TEXT; DTO limita string a 5.000.000 caracteres, não arquivo 10 MB|PARCIAL: funciona com imagem pequena; não é Storage nem validação completa de upload|
|Galeria|input multiple; handler considera primeiro arquivo e guarda nome|galeria_nome não entra no buildPayload nem DTO|UI PARCIAL; bytes não enviados nem persistidos|
|Documento|accept PDF/DOC; portfolio_doc_nome guarda file.name|Nome/arquivo omitidos do payload|NÃO IMPLEMENTADO; nome na revisão não prova upload|
|Vídeo|accept video; video_nome guarda nome|Sem bytes/URL/payload, sem medição de duração|NÃO IMPLEMENTADO; 30s não validados|
|Áudio|accept audio; audio_nome guarda nome|Sem bytes/URL/payload|NÃO IMPLEMENTADO|

Inventariados input type=file, FileReader, canvas, DataURL, handleGenericFileUpload, buildPayload, DTO, artistas.service e renderização do Portal. Não há chamada `storage.from(...).upload` no fluxo auditado. Não se inspecionou remotamente a existência de buckets; ausência de implementação local não comprova ausência de bucket na conta.

## Teste executado

Fixture sintética sem imagem pessoal: PNG sólido 64×48. Selecionada pelo botão nativo usando Enter; convertida a `data:image/jpeg;base64,` com 1063 caracteres. Galeria abriu seletor multiple por Space; documento/vídeo/áudio aceitaram seleção fictícia TXT pelo seletor de teste apesar do accept, evidenciando que accept é orientação, não validação de segurança. Os botões de upload passaram a ser elementos button, mantendo os handlers existentes.

O cadastro foi enviado somente ao Nest simulado 127.0.0.1:3207, com Vite 5187 configurado explicitamente para API e Auth locais. Estado confirmou artista ID 10, nome SMOKE_TEST_UI_UPLOAD, Pendente, foto 1063 caracteres, uma conta e uma solicitação de mail simuladas. Depois de aprovar só essa fixture, o catálogo/modal carregou a imagem com complete=true, naturalWidth=64, naturalHeight=48 e DataURL JPEG. E2E adicional confirma transporte e retorno após aprovação com persistência em memória. **Não é prova de persistência no PostgreSQL remoto.** Nenhum segundo cadastro foi enviado durante o percurso de reflow.

Provas: [estado após envio](front-quality-evidence/upload-memory-state.json), [foto após aprovação](front-quality-evidence/photo-after-approval.png), [browser-results](front-quality-evidence/browser-results.json), [teste W](../../backend/test/workflows.e2e-spec.ts). Evidências/nomes de arquivo são fictícios; endereços .example.test não foram enviados a destinatários reais.

Não foram executados arquivos exatos 10 MB/>10MB nem vídeos 30s/>30s: não há implementação completa para homologar esses limites. CT-RF03-01/07 e CT-RF05-05 são parciais; CT-RF03-02..06 revelam lacuna A-08. CT-RF03-08 sem portfólio passou localmente, conforme RN-09. Texto do passo 3 agora esclarece que apenas a foto segue no cadastro.

## Riscos atuais

Base64 aumenta payload, tráfego e tamanho da coluna/retorno do catálogo, dificulta cache e geração de miniaturas e pode afetar o cenário de 1000 artistas. JPEG pode remover transparência e alterar orientação/qualidade; fallback pode manter tipo original e metadados. Limite de caracteres não equivale a 10 MB, e corpo HTTP pode limitar antes do DTO. accept não valida MIME real, assinatura ou conteúdo. URLs externas trazem riscos de disponibilidade/rastreamento; backend não deve buscar URL arbitrária sem proteção contra SSRF. Não há varredura de malware, duração de vídeo, limpeza de mídia, Storage/CDN ou ligação autorizada de arquivo por artista. A foto legada foi preservada, sem afirmar que o requisito de mídias está concluído.

## Plano técnico separado — A-08 (não executado)

1. Definir com equipe se o limite de 10 MB é por arquivo e quais quantidades/formatos serão aceitos. Manter requisito oficial de vídeo≤30s e portfólio opcional RN-09; não inventar limite de áudio/documento sem decisão.
2. Propor bucket privado de trabalho/quarentena e publicação controlada de mídia aprovada. Nome sugerido precisa aprovação operacional; não criar automaticamente. Acesso de anon/authenticated direto negado; backend valida papel/ownership antes de emitir autorização/URL assinada. Autoedição depende de C-02, não de artistId fornecido pelo cliente.
3. Policies/grants mínimos e reproduzíveis em migration revisada futura; Secret exclusivamente servidor. Política de tabela e de objeto são camadas distintas. Fotos públicas só após aprovação; originais/documentos privados por padrão.
4. Endpoint autenticado de upload ou URL assinada de curta duração com tamanho/MIME restritos; backend confirma objeto, assinatura e vínculo. Para cadastro público antes de existir ficha, definir primeiro uma sessão/nonce e rate limit seguros. Não aceitar caminho arbitrário fornecido pelo cliente.
5. Path canônico por artista e identificador aleatório gerado no servidor, por exemplo `artistas/{id}/{uuid}.jpg`; nunca usar CPF/e-mail/nome original no path. Normalizar/extensão por conteúdo, impedir traversal e colisões.
6. Allowlist proposta a validar: JPEG/PNG/WebP para foto, MP4 com análise real de metadados/duração para vídeo, formatos de áudio/documento conforme aceite. Verificar MIME por bytes/magic, decodificar e reencodar imagem, restringir dimensões/descompressão; não confiar em extensão ou Content-Type. Considerar recusar SVG/HTML e documentos ativos; quarentena e análise antimalware de PDFs/docs/áudios/vídeos antes de disponibilizar.
7. Salvar metadata/chave do objeto, tamanho, tipo, checksum, estado e vínculo em schema futuro aprovado; URLs assinadas expiram, não devem ser persistidas como fonte permanente. Gerar miniaturas e servir versões otimizadas/cacheadas ao catálogo; não enviar 1000 imagens Base64 na listagem.
8. Definir operações de troca/desaprovação/exclusão e retenção: retirar acesso público imediatamente quando necessário, remover objeto/versionamento conforme política validada, tratar falha parcial DB/Storage com fila/retry idempotente. Excluir cadastro não pode deixar documento público órfão.
9. LGPD: finalidade/consentimento informados, mínimo de dados/EXIF, acesso auditado, retenção e direito de remoção definidos com responsável; não guardar documento pessoal em bucket público. Rotina de órfãos compara DB/Storage após janela segura, com dry-run, ID/chave exatos e autorização operacional.
10. Testes futuros: MIME falso, arquivo corrompido, zero bytes,10 MB exato/>10MB,30s exatos/>30s, dimensões extremas, link expirado, ownership, anon/comum/admin, interrupção, antimalware, cache, revogação e coleta de órfãos. Deploy e políticas precisam de rodada própria; nenhuma mudança remota nesta avaliação.

## Parecer sobre carrossel

Recomendação nesta etapa: **manter o grid como navegação principal e adiar o carrossel** até resolver mídias/performance e definir um critério neutro. O catálogo remoto tem 11 aprovados na leitura registrada; o grid permite comparar e descobrir todos, enquanto carrossel pode esconder itens, aumentar navegação por teclado e carregar imagens adicionais. Favoritos/selo Disponível atuais não são base para ranking ou destaque real.

Se a equipe aprovar uma faixa complementar futura: manual, sem autoplay, anterior/próximo nativos, foco previsível, itens fora da tela sem foco invisível, indicador acessível quando necessário e anúncio discreto de posição; swipe é complemento, nunca único controle. Respeitar reduced-motion; desktop com vários cards e mobile com gesto/controles visíveis. Usar miniaturas, lazyload, dados aprovados e limite explícito, preservando busca/grid. “Últimos aprovados” requer timestamp de aprovação confiável, inexistente no contrato atual; hoje o backend ordena aprovados por created_at desc. Não chamar essa ordem de última aprovação. Alternativa futura: seleção editorial explícita com critério e autorização definidos. Não implementar popularidade/ranking nesta rodada.
