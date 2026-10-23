import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { filterArtists } from '../src/lib/catalogFilter.ts';
import { artistLoginError } from '../src/lib/authMessages.ts';
import { validateCadastro } from '../src/lib/cadastroValidation.ts';

const artists=[{nome:'João Souza',nome_artistico:'Voz do Pampa',area_atuacao:'Música',tags:['Festival']},{nome:'Maria Rosa',nome_artistico:null,area_atuacao:'Teatro',tags:['Infantil']}];
for(const [id,query,category,expected] of [
 ['CT-RF06-01','João Souza','all',1],['CT-RF06-02','João','all',1],['CT-RF06-03','','Música',1],['CT-RF06-04','João','Teatro',0],['CT-RF06-05','Festival','Música',1],['CT-RF06-06','inexistente','all',0],['CT-RF06-07','','Teatro',1],['nome artístico','Voz do Pampa','all',1],
])test(`${id}: busca textual combinada com categoria`,()=>assert.equal(filterArtists(artists,query,category).length,expected));
test('mensagem de e-mail não confirmado não recomenda desabilitar proteção',()=>{
 const message=artistLoginError({code:'email_not_confirmed',message:'Email not confirmed'});
 assert.match(message,/ainda não foi confirmado/);assert.doesNotMatch(message,/Supabase|desmarque|Confirm email/);
});
test('CT-RF07-02/03 mensagens inválidas e falhas externas não expõem detalhes técnicos',()=>{
 assert.equal(artistLoginError({code:'invalid_credentials',message:'Invalid login credentials'}),'E-mail ou senha incorretos.');
 assert.equal(artistLoginError({message:'internal-key-fixture-error'}),'Não foi possível entrar. Tente novamente em alguns instantes.');
});
test('CT-RF02-08/09 confirmação de senha e mínimo oficial de mini-bio',()=>{
 const valid={nome:'Pessoa Fictícia',nome_artistico:'',cpf:'52998224725',cnpj:'',email:'person@example.test',contato:'53999990000',cidade:'Bagé',categorias:['Música'],bio:'a'.repeat(20),tags:[],disponibilidade:[],foto_url:'',instagram:'',site:''};
 assert.deepEqual(validateCadastro(valid,'abcdef','abcdef'),{});
 assert.ok(validateCadastro({...valid,bio:'a'.repeat(19)},'abcdef','abcdef').bio);
 assert.ok(validateCadastro(valid,'abcdef','abcdeg').confirmarSenha);
});
test('CT-RNF03-01/02/03/04/05 e CT-RF06-08: dataset local de 1000 e consultas repetidas até 5s',t=>{
 const rows=Array.from({length:1000},(_,i)=>({nome:`SMOKE_TEST_Artista ${i}`,nome_artistico:`Público ${i}`,area_atuacao:i%2?'Teatro':'Música',tags:['Festival']}));
 const start=performance.now();
 for(let i=0;i<100;i++)for(const [q,c] of [['','all'],['Artista 99','all'],['','Música'],['Artista 9','Música']])filterArtists(rows,q,c);
 const elapsed=performance.now()-start;assert.ok(elapsed<5000);t.diagnostic(`400 consultas em memória / 1000 registros: ${elapsed.toFixed(2)}ms. Não mede rede nem carga de produção.`);
 assert.equal(filterArtists(rows,'','Música').length,500);
});
