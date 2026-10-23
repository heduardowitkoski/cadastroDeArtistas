import { HomeButton } from "../../components/HomeButton";

export default function EdicaoIndisponivel() {
  return (
    <main className="cadastro-page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="artista-card" style={{ maxWidth: 560, width: '100%', minWidth: 0, padding: 32, textAlign: 'center' }}>
        <h1 style={{ overflowWrap: 'anywhere' }}>Edição temporariamente indisponível</h1>
        <p style={{ margin: '16px 0 24px' }}>
          Ainda não é possível alterar o cadastro pela Área do Artista. Seu cadastro permanece como está.
        </p>
        <HomeButton />
      </div>
    </main>
  )
}
