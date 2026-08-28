import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Palette, LogIn, Loader, ChevronLeft, Sparkles } from "lucide-react";
import "./Artista.css";

export default function ArtistaLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
    } else {
      navigate("/artista/editar");
    }
  };

  return (
    <div className="artista-login-page">
      <div className="artista-login-top">
        <Link to="/" className="btn btn-secondary btn-sm">
          <ChevronLeft size={15} /> Voltar ao catálogo
        </Link>
      </div>

      <div className="artista-login-card">
        <div className="artista-login-brand">
          <div className="brand-icon"><Palette size={22} /></div>
          <h1>Área do Artista</h1>
          <p>Entre para editar seus dados de cadastro</p>
        </div>

        <form onSubmit={handleLogin} className="artista-login-form">
          <div className="input-group">
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="input-group">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="login-error artista-login-error">{error}</div>}

          <button type="submit" className="btn btn-primary artista-login-btn" disabled={loading}>
            {loading ? <><Loader size={16} className="spin" /> Entrando...</> : <><LogIn size={16} /> Entrar</>}
          </button>
        </form>

        <div className="artista-login-dica">
          <Sparkles size={15} />
          <span>Ainda não é cadastrado? <Link to="/cadastrar">Crie seu perfil aqui</Link>.</span>
        </div>
      </div>
    </div>
  );
}