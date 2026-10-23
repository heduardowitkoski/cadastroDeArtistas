import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Somente navegação: não acessa Auth nem modifica a sessão. */
export function HomeButton({ className = '' }: { className?: string }) {
  return <Link to="/" className={`btn btn-secondary home-button ${className}`} aria-label="Home — voltar à página inicial"><Home size={18} aria-hidden="true" /><span>Home</span></Link>;
}
