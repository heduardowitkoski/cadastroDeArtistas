// Execução opt-in de QA: NestJS real com Supabase completamente substituído.
// Não importa main.ts nem instancia clientes remotos; não usa credenciais reais.
require('ts-node/register/transpile-only');
const { Test } = require('@nestjs/testing');
const { json } = require('express');
const { AppModule } = require('../src/app.module');
const { SupabaseService } = require('../src/supabase/supabase.service');
const { configureValidation } = require('../src/validation/configure-validation');
const { qualityFixture } = require('./support/quality-fixture');

async function start() {
  const fixture = qualityFixture(9);
  let mode = 'normal';
  let loginMode = 'admin';
  const requests = [];
  const encode = data => Buffer.from(JSON.stringify(data)).toString('base64url');
  const user = role => ({id: role+'-local-fixture', aud:'authenticated', role:'authenticated', email:role+'@example.test',app_metadata:role==='admin'?{role:'admin'}:{}, user_metadata:{}, created_at:'2026-10-23T00:00:00Z',email_confirmed_at:'2026-10-23T00:00:00Z'});
  const tokens = new Map();
  fixture.service.getAuthClient().auth.getUser = async token => ({data:{user: tokens.get(token)||null},error:tokens.has(token)?null:{message:'Invalid local fixture token'}});
  const module = await Test.createTestingModule({imports:[AppModule]}).overrideProvider(SupabaseService).useValue(fixture.service).compile();
  if(process.env.ARTIST_PROFILE_FIXTURE==='1') {
    const { readFile }=require('node:fs/promises');
    const { resolve }=require('node:path');
    const { PDFDocument }=require('pdf-lib');
    const { ArtistProfileService }=require('../src/artistas/profile/artist-profile.service');
    const { prepareMedia }=require('../src/artistas/profile/media-validation');
    const image=await require('sharp')(await readFile(resolve(__dirname,'../../frontend/public/bage-bg.jpg'))).jpeg().toBuffer();
    const doc=await PDFDocument.create();doc.addPage().drawText('SMOKE_TEST - Portfolio ficticio local');
    const pdf=Buffer.from(await doc.save());
    const file=(buffer,name,mime)=>({buffer,size:buffer.length,originalname:name,mimetype:mime});
    Object.assign(fixture.state.artists[0],{nome_artistico:'Arte do Pampa',area_atuacao:'Artes Visuais',bio:'Produção artística e memória da nossa cidade.\n\nPerfil sintético para validar a nova página, a galeria, o portfólio e a agenda em ambiente local.',instagram:'@arte_do_pampa',site:'https://example.test',tags:['Arte local','Memória','Cultura'],disponibilidade:['Fins de semana','Eventos diurnos']});
    const profile=module.get(ArtistProfileService);
    await profile.store(1,await prepareMedia({photo:[file(image,'foto.jpg','image/jpeg')],gallery:Array.from({length:8},(_,i)=>file(image,`SMOKE_TEST_Trabalho ${i+1}.jpg`,'image/jpeg')),portfolio:[file(pdf,'SMOKE_TEST_Portfolio.pdf','application/pdf')]}));
    await profile.saveEvent(1,{titulo:'SMOKE_TEST_Encontro de arte',descricao:'Evento fictício para teste local.',starts_at:'2030-10-23T18:00:00-03:00',local:'Espaço cultural',cidade:'Bagé',link:null,is_public:true});
  }
  const app = module.createNestApplication();
  app.enableCors({origin:'http://127.0.0.1:5187',credentials:true});
  app.use(json({limit:'10mb'}));
  app.use((req,res,next) => {
    requests.push({method:req.method,path:req.path});
    if(req.path==='/__qa/control') {
      if(req.query.mode) mode=String(req.query.mode);
      if(req.query.login) loginMode=String(req.query.login);
      if(req.query.count) fixture.state.artists=qualityFixture(Number(req.query.count)).state.artists;
      fixture.state.databaseFailure=mode==='error';
      return res.json({mode,login:loginMode});
    }
    if(req.path==='/__qa/state')return res.json({mode,requestCount:requests.length,postCount:requests.filter(r=>r.method==='POST').length,artists:fixture.state.artists.map(a=>({id:a.id,nome:a.nome,status:a.status,photoLength:a.foto_url?.length||0,photoType:a.foto_url?.slice(0,23)||null})),feedbackCount:fixture.state.feedbacks.length,authCount:fixture.state.users.size,mailRequests:fixture.state.emailRequests.length});
    if(req.path==='/auth/v1/token') {
      if(req.body.email==='invalid@example.test')return res.status(400).json({code:'invalid_credentials',message:'Invalid login credentials'});
      if(loginMode==='unconfirmed')return res.status(400).json({code:'email_not_confirmed',message:'Email not confirmed'});
      const role=loginMode==='common'?'artist':'admin';const u=user(role);
      const token=encode({alg:'HS256',typ:'JWT'})+'.'+encode({sub:u.id,exp:Math.floor(Date.now()/1000)+3600,aud:'authenticated',app_metadata:u.app_metadata})+'.local-fixture';
      tokens.set(token,u);return res.json({access_token:token,refresh_token:'local-fixture-refresh',token_type:'bearer',expires_in:3600,user:u});
    }
    if(req.path==='/auth/v1/user')return res.json(tokens.get(req.headers.authorization?.replace('Bearer ',''))||user('admin'));
    if(req.path==='/auth/v1/logout')return res.status(204).end();
    if(req.path.startsWith('/auth/'))return res.status(404).json({message:'Local auth fixture only'});
    if(mode==='slow')setTimeout(next,1500);else next();
  });
  configureValidation(app);
  await app.listen(3207,'127.0.0.1');
  console.log('QA LOCAL: http://127.0.0.1:3207 — API/Auth em memória, zero conexão Supabase.');
}
start().catch(()=>{console.error('Falha ao iniciar fixture local de QA.');process.exitCode=1;});
