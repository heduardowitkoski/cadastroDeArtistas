const fs = require('fs');

async function populate() {
  const API_URL = 'http://localhost:3001/artistas';
  
  const getBase64 = (filePath) => {
    if (!filePath || !fs.existsSync(filePath)) return null;
    const bitmap = fs.readFileSync(filePath);
    return 'data:image/png;base64,' + Buffer.from(bitmap).toString('base64');
  };

  const artists = [
    {
      nome: 'Mariana Lins',
      nome_artistico: 'Mari Lins',
      email: 'mariana.lins@example.com',
      contato: '(53) 98888-1111',
      cidade: 'Bagé',
      area_atuacao: 'Artes Visuais',
      bio: 'Artista plástica e pintora bageense com foco em retratos realistas e paisagens urbanas.',
      tags: ['Pintura em Tela', 'Ilustração Digital'],
      disponibilidade: ['Dias úteis', 'Fins de semana'],
      foto_url: getBase64('/home/heduardo/.gemini/antigravity-ide/brain/8e17117c-fa84-4763-b284-2808c97c12fb/mariana_lins_1788832908025.png'),
    },
    {
      nome: 'João Pedroso',
      nome_artistico: 'João Pedroso Acústico',
      email: 'joao.pedroso@example.com',
      contato: '(53) 98888-2222',
      cidade: 'Bagé',
      area_atuacao: 'Música',
      bio: 'Violonista e cantor focado em MPB e música regional gaúcha.',
      tags: ['Música Autoral', 'Cover / Tributo'],
      disponibilidade: ['Eventos noturnos', 'Fins de semana'],
      foto_url: getBase64('/home/heduardo/.gemini/antigravity-ide/brain/8e17117c-fa84-4763-b284-2808c97c12fb/joao_pedroso_1788832919026.png'),
    },
    {
      nome: 'Companhia Vento Forte',
      nome_artistico: 'Teatro Vento Forte',
      email: 'ventoforte@example.com',
      contato: '(53) 98888-3333',
      cidade: 'Bagé',
      area_atuacao: 'Teatro',
      bio: 'Companhia de teatro independente realizando peças clássicas e intervenções urbanas.',
      tags: ['Teatro de Rua', 'Oficina / Workshop'],
      disponibilidade: ['Fins de semana', 'Feriados'],
      foto_url: getBase64('/home/heduardo/.gemini/antigravity-ide/brain/8e17117c-fa84-4763-b284-2808c97c12fb/teatro_vento_1788832930617.png'),
    },
    {
      nome: 'Ana Rosa Silva',
      nome_artistico: 'Ana Rosa',
      email: 'ana.rosa@example.com',
      contato: '(53) 98888-4444',
      cidade: 'Bagé',
      area_atuacao: 'Dança',
      bio: 'Bailarina contemporânea com experiência em festivais de dança de rua.',
      tags: ['Dança Contemporânea', 'Oficina / Workshop'],
      disponibilidade: ['Fins de semana', 'Eventos diurnos'],
      foto_url: null,
    },
    {
      nome: 'Grupo Circo do Sol',
      nome_artistico: 'Circo do Sol',
      email: 'circo.sol@example.com',
      contato: '(53) 98888-5555',
      cidade: 'Bagé',
      area_atuacao: 'Circo',
      bio: 'Trupe de malabaristas e palhaços para eventos infantis e festivais.',
      tags: ['Circo / Malabares', 'Teatro de Rua'],
      disponibilidade: ['Fins de semana', 'Feriados', 'Eventos diurnos'],
      foto_url: null,
    },
    {
      nome: 'Lucas Mendes',
      nome_artistico: 'Lucas Filmmaker',
      email: 'lucas.mendes@example.com',
      contato: '(53) 98888-6666',
      cidade: 'Bagé',
      area_atuacao: 'Audiovisual',
      bio: 'Cineasta independente e editor de vídeo trabalhando com documentários curtos.',
      tags: ['Produção Audiovisual'],
      disponibilidade: ['Dias úteis', 'Fins de semana'],
      foto_url: null,
    },
    {
      nome: 'Teresa Martins',
      nome_artistico: 'Teresa Cerâmicas',
      email: 'teresa.martins@example.com',
      contato: '(53) 98888-7777',
      cidade: 'Bagé',
      area_atuacao: 'Artesanato',
      bio: 'Artesã especializada em cerâmica e peças decorativas inspiradas na cultura gaúcha.',
      tags: ['Artesanato em Couro', 'Artesanato em Madeira'], // close enough predefined tags
      disponibilidade: ['Dias úteis'],
      foto_url: null,
    }
  ];

  for (const artista of artists) {
    try {
      console.log(`Criando: ${artista.nome}`);
      const resCreate = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artista)
      });
      const created = await resCreate.json();
      
      if (created && created.id) {
        console.log(`Aprovando: ${artista.nome} (ID: ${created.id})`);
        await fetch(`${API_URL}/${created.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Aprovado' })
        });
      } else {
        console.error('Falha ao criar:', created);
      }
    } catch (e) {
      console.error(e);
    }
  }
}

populate();
