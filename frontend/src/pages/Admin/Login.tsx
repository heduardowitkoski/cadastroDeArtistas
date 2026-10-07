import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Palette, LogIn, Loader } from "lucide-react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
    } else if (data.user.app_metadata?.role !== "admin") {
      await supabase.auth.signOut();
      setError("Esta conta não possui acesso administrativo.");
      setLoading(false);
    } else {
      navigate("/admin");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-brand">
          <div className="brand-icon" aria-hidden="true"><Palette size={24} aria-hidden="true" /></div>
          <h1>Painel Administrativo</h1>
          <p>Gestão de Cadastros de Artistas</p>
        </div>

        <form onSubmit={handleLogin} className="login-form" aria-label="Formulário de acesso administrativo" noValidate>
          <div className="input-group">
            <label htmlFor="admin-email">E-mail</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cultura.bage.rs.gov.br"
              required
              aria-required="true"
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="admin-senha">Senha</label>
            <input
              id="admin-senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              aria-required="true"
              autoComplete="current-password"
              aria-describedby={error ? "admin-login-error" : undefined}
            />
          </div>

          {error && (
            <div id="admin-login-error" className="login-error" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading
              ? <><Loader size={16} className="spin" aria-hidden="true" /> <span>Entrando...</span></>
              : <><LogIn size={16} aria-hidden="true" /> <span>Entrar</span></>
            }
          </button>
          <Link to="/" className="btn btn-secondary login-home-link">Voltar ao catálogo</Link>
        </form>
      </div>
      <div className="login-glow" aria-hidden="true" />
    </div>
  );
}
