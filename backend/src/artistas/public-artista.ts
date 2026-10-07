// Campos necessários ao mural e ao perfil público. Não incluir email, CPF/CNPJ ou status.
export const PUBLIC_ARTISTA_COLUMNS =
  'id,nome,nome_artistico,area_atuacao,bio,foto_url,instagram,site,contato,cidade,tags,disponibilidade';

export interface PublicArtista {
  id: number;
  nome: string;
  nome_artistico: string | null;
  area_atuacao: string;
  bio: string | null;
  foto_url: string | null;
  instagram: string | null;
  site: string | null;
  contato: string | null;
  cidade: string | null;
  tags: string[] | null;
  disponibilidade: string[] | null;
}

export function toPublicArtista(row: PublicArtista): PublicArtista {
  return {
    id: row.id,
    nome: row.nome,
    nome_artistico: row.nome_artistico,
    area_atuacao: row.area_atuacao,
    bio: row.bio,
    foto_url: row.foto_url,
    instagram: row.instagram,
    site: row.site,
    contato: row.contato,
    cidade: row.cidade,
    tags: row.tags,
    disponibilidade: row.disponibilidade,
  };
}
