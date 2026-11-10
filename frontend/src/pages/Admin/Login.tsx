import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity, AlertCircle, ArrowLeft, ArrowRight, CheckCircle,
  LockKeyhole, Loader, Mail, ShieldCheck, Users
} from "lucide-react";
import { PasswordInput } from "../../components/PasswordInput";
import { setSupabaseSessionPersistence, supabase } from "../../lib/supabase";
import "./Login.css";

type LoginMode = "login" | "request-reset" | "update-password";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [rememberAccess, setRememberAccess] = useState(true);
  const [mode, setMode] = useState<LoginMode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update-password");
        setError("");
        setNotice("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    setSupabaseSessionPersistence(rememberAccess);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (loginError) {
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

  const handlePasswordResetRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`,
    });

    if (resetError) {
      setError("Não foi possível enviar o link agora. Verifique o e-mail ou tente novamente.");
    } else {
      setNotice("Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha.");
    }
    setLoading(false);
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (senha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: senha });
    if (updateError) {
      setError("Não foi possível atualizar a senha. Solicite um novo link de redefinição.");
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setSenha("");
    setConfirmarSenha("");
    setMode("login");
    setNotice("Senha atualizada. Entre no painel com sua nova senha.");
    setLoading(false);
  };

  const handleModeChange = (nextMode: LoginMode) => {
    setMode(nextMode);
    setError("");
    setNotice("");
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-showcase" aria-labelledby="admin-showcase-title">
        <div className="admin-login-showcase-content">
          <Link to="/" className="admin-login-brand" aria-label="Cadastro Municipal de Artistas — voltar para a página inicial">
            <img src="/cmpcc-logo.png" alt="" width={100} height={88} />
            <span>
              <strong>Cadastro Municipal<br />de Artistas</strong>
              <small>Bagé · A nossa cidade</small>
            </span>
          </Link>

          <p className="admin-login-eyebrow">PAINEL ADMINISTRATIVO</p>
          <h1 id="admin-showcase-title">Painel administrativo<br />da <span>cultura de Bagé</span></h1>
          <p className="admin-login-intro">Gerencie artistas, categorias, eventos e conteúdos que fortalecem a cultura da nossa cidade.</p>

          <ul className="admin-login-features">
            <li>
              <span className="admin-feature-icon"><Users size={19} aria-hidden="true" /></span>
              <span><strong>Gestão completa</strong><small>Cadastre e gerencie artistas, categorias, eventos e conteúdos culturais.</small></span>
            </li>
            <li>
              <span className="admin-feature-icon admin-feature-icon--green"><Activity size={19} aria-hidden="true" /></span>
              <span><strong>Acompanhamento em tempo real</strong><small>Visualize dados, estatísticas e o impacto da cultura em Bagé.</small></span>
            </li>
            <li>
              <span className="admin-feature-icon admin-feature-icon--amber"><ShieldCheck size={19} aria-hidden="true" /></span>
              <span><strong>Mais cultura para nossa cidade</strong><small>Uma gestão eficiente para valorizar e conectar talentos locais.</small></span>
            </li>
          </ul>
        </div>
      </section>

      <section className="admin-login-form-panel" aria-labelledby="admin-login-title">
        <Link to="/" className="admin-login-back"><ArrowLeft size={16} aria-hidden="true" /> Voltar para o site público</Link>

        <div className="admin-login-card">
          <div className="admin-lock-icon" aria-hidden="true"><LockKeyhole size={22} /></div>
          <p className="admin-login-card-eyebrow">ACESSO RESTRITO</p>
          <h2 id="admin-login-title">{mode === "update-password" ? "Redefinir senha" : mode === "request-reset" ? "Recuperar acesso" : "Entrar no painel"}</h2>
          <p className="admin-login-card-description">
            {mode === "update-password"
              ? "Defina uma nova senha para sua conta administrativa."
              : mode === "request-reset"
                ? "Informe o e-mail da sua conta para receber o link de redefinição."
                : "Informe suas credenciais para acessar o painel administrativo da cultura de Bagé."}
          </p>

          {error && <div id="admin-login-error" className="admin-login-alert" role="alert"><AlertCircle size={17} aria-hidden="true" /><span>{error}</span></div>}
          {notice && <div className="admin-login-notice" role="status"><CheckCircle size={17} aria-hidden="true" /><span>{notice}</span></div>}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="admin-login-form" aria-label="Formulário de acesso administrativo" noValidate>
              <div className="admin-login-field">
                <label htmlFor="admin-email">E-mail</label>
                <div className="admin-login-input-wrap">
                  <Mail size={18} aria-hidden="true" />
                  <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" required aria-required="true" autoComplete="email" />
                </div>
              </div>

              <div className="admin-login-field">
                <label htmlFor="admin-senha">Senha</label>
                <div className="admin-login-input-wrap admin-login-password-wrap">
                  <LockKeyhole size={18} aria-hidden="true" />
                  <PasswordInput id="admin-senha" value={senha} onChange={(event) => setSenha(event.target.value)} placeholder="Sua senha" required aria-required="true" autoComplete="current-password" aria-describedby={error ? "admin-login-error" : undefined} />
                </div>
              </div>

              <div className="admin-login-options">
                <label className="admin-remember-option" htmlFor="admin-remember">
                  <input id="admin-remember" type="checkbox" checked={rememberAccess} onChange={(event) => setRememberAccess(event.target.checked)} />
                  <span>Lembrar meu acesso</span>
                </label>
                <button type="button" className="admin-forgot-link" onClick={() => handleModeChange("request-reset")}>Esqueci minha senha</button>
              </div>

              <button type="submit" className="admin-login-submit" disabled={loading}>
                {loading ? <><Loader size={17} className="spin" aria-hidden="true" /> Entrando...</> : <>Entrar <ArrowRight size={17} aria-hidden="true" /></>}
              </button>
            </form>
          )}

          {mode === "request-reset" && (
            <form onSubmit={handlePasswordResetRequest} className="admin-login-form" aria-label="Solicitar redefinição de senha" noValidate>
              <div className="admin-login-field">
                <label htmlFor="admin-reset-email">E-mail</label>
                <div className="admin-login-input-wrap">
                  <Mail size={18} aria-hidden="true" />
                  <input id="admin-reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" required aria-required="true" autoComplete="email" />
                </div>
              </div>
              <button type="submit" className="admin-login-submit" disabled={loading}>
                {loading ? <><Loader size={17} className="spin" aria-hidden="true" /> Enviando...</> : <>Enviar link <ArrowRight size={17} aria-hidden="true" /></>}
              </button>
              <button type="button" className="admin-forgot-link admin-reset-back" onClick={() => handleModeChange("login")}><ArrowLeft size={15} aria-hidden="true" /> Voltar para entrar</button>
            </form>
          )}

          {mode === "update-password" && (
            <form onSubmit={handlePasswordUpdate} className="admin-login-form" aria-label="Atualizar senha administrativa" noValidate>
              <div className="admin-login-field">
                <label htmlFor="admin-new-password">Nova senha</label>
                <PasswordInput id="admin-new-password" value={senha} onChange={(event) => setSenha(event.target.value)} placeholder="Digite a nova senha" required aria-required="true" autoComplete="new-password" />
              </div>
              <div className="admin-login-field">
                <label htmlFor="admin-confirm-password">Confirmar nova senha</label>
                <PasswordInput id="admin-confirm-password" value={confirmarSenha} onChange={(event) => setConfirmarSenha(event.target.value)} placeholder="Repita a nova senha" required aria-required="true" autoComplete="new-password" />
              </div>
              <button type="submit" className="admin-login-submit" disabled={loading}>
                {loading ? <><Loader size={17} className="spin" aria-hidden="true" /> Salvando...</> : <>Salvar nova senha <ArrowRight size={17} aria-hidden="true" /> </>}
              </button>
            </form>
          )}

          {mode === "login" && <>
            <div className="admin-login-divider"><span>ou</span></div>
            <div className="admin-login-restricted-note"><ShieldCheck size={18} aria-hidden="true" /><p>Área administrativa reservada à equipe autorizada do Conselho Municipal de Políticas Culturais de Bagé.</p></div>
          </>}
        </div>
      </section>
    </main>
  );
}
