async function updatePhotos() {
  const API_URL = 'http://localhost:3001/artistas';
  
  const updates = [
    { id: 12, nome: 'Ana Rosa Silva', foto_url: 'https://picsum.photos/seed/anarosa/400/400' },
    { id: 13, nome: 'Grupo Circo do Sol', foto_url: 'https://picsum.photos/seed/circosol/400/400' },
    { id: 14, nome: 'Lucas Mendes', foto_url: 'https://picsum.photos/seed/lucasmendes/400/400' },
    { id: 15, nome: 'Teresa Martins', foto_url: 'https://picsum.photos/seed/teresamartins/400/400' }
  ];

  for (const update of updates) {
    try {
      console.log(`Atualizando foto de: ${update.nome}`);
      const res = await fetch(`${API_URL}/${update.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foto_url: update.foto_url, forceStatus: true })
      });
      if (res.ok) {
        console.log(`Sucesso: ${update.nome}`);
      } else {
        console.error(`Erro ao atualizar ${update.nome}:`, await res.text());
      }
    } catch (e) {
      console.error(`Erro em ${update.nome}:`, e.message);
    }
  }
}

updatePhotos();
