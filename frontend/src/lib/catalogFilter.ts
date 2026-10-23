export interface SearchableArtist {
  nome: string;
  nome_artistico?: string | null;
  area_atuacao?: string | null;
  tags?: string[] | null;
}

/** Aplica busca textual e categoria em conjunto sobre a resposta pública. */
export function filterArtists<T extends SearchableArtist>(artists: T[], query: string, category = 'all'): T[] {
  const term = query.toLowerCase();
  const categoryTerm = category.toLowerCase();
  return artists.filter((artist) => {
    const area = (artist.area_atuacao || '').toLowerCase();
    const textMatch = !term || artist.nome.toLowerCase().includes(term) || (artist.nome_artistico || '').toLowerCase().includes(term) || area.includes(term) || (artist.tags || []).some((tag) => tag.toLowerCase().includes(term));
    return textMatch && (category === 'all' || area.includes(categoryTerm));
  });
}
