# Escopo funcional e baseline de testes

## Fluxos obrigatórios atuais

### RF-01 Cadastro autônomo
Cadastro realizado pelo artista sem intervenção administrativa e persistido inicialmente
como `Pendente`.

### RF-02 Validação
Campos inválidos devem ser bloqueados com feedback claro. O back-end também deve validar.

### RF-03 Mídias/portfólio
Quando upload estiver no escopo real, deve respeitar formatos/limites e vínculo ao artista.
A documentação de testes prevê 10 MB e vídeo de até 30 s.

### RF-04 Catálogo
Somente aprovados aparecem publicamente.

### RF-05 Detalhes
Perfil público apresenta corretamente apenas informações públicas do aprovado.

### RF-06 Busca
Busca por nome/categoria e combinações definidas. Há referências também a tags.
Confirmar o que a implementação atual realmente suporta.

### RF-07 Autenticação/controle de acesso
Administração exige autenticação e autorização reais.

### RF-08 Aprovação
Pendente -> Aprovado deve persistir e refletir no catálogo/busca.

### RF-09 Edição
Admin edita. A documentação de testes também prevê edição pelo artista e retorno para
`Pendente` após edição de cadastro aprovado; verificar se isso foi realmente adotado.

### RF-10 Exclusão/desaprovação
Desaprovação retira do catálogo sem apagar o registro.
Exclusão tem efeito distinto.

### RF-11 Feedback
Público envia feedback identificado ou anônimo; feedback não é público; admin pode consultar
e remover.

## Requisitos não funcionais

- RNF-01 Responsividade.
- RNF-02 Segurança/LGPD.
- RNF-03 Catálogo/busca em até 5 s no cenário de teste.
- RNF-04 Usabilidade com usuários reais.
- RNF-05 Manutenibilidade.
- RNF-06 Documentação.
- RNF-07 Testabilidade/rastreabilidade.
- RNF-08 Escalabilidade.
- RNF-09 Exportação de dados administrativos, se mantida no escopo atual.

## Casos de teste prioritários

### Cadastro/validação
- cadastro válido;
- persistência Pendente;
- obrigatórios vazios;
- e-mail inválido/duplicado;
- telefone/link inválidos;
- senha e confirmação, se autenticação de artista existir;
- descrição mínima.

### Catálogo
- aprovado aparece;
- pendente não aparece;
- rejeitado não aparece;
- desaprovado deixa de aparecer;
- catálogo acessível sem login.

### Busca
- nome exato/parcial;
- categoria;
- combinação;
- tag, se suportada;
- não aprovado nunca aparece.

### Admin
- login válido/inválido;
- acesso direto sem sessão;
- usuário sem papel admin;
- aprovação;
- persistência;
- rejeição/desaprovação;
- exclusão.

### Feedback
- identificado;
- anônimo;
- sem login;
- validação;
- consulta somente administrativa;
- exclusão.

### Integração
Front React/Vercel -> API NestJS/Render -> PostgreSQL/Supabase/Auth.

### Segurança
- zero exposição indevida;
- validação também no back;
- autorização no back;
- policies/configuração de Supabase revisadas.

### Performance
Base de homologação com aproximadamente 1000 registros fictícios.
Meta documental: catálogo e busca em até 5 segundos no cenário definido.

### Usabilidade
Validar tarefas reais com:
- artistas;
- servidores/administradores;
- público.
