import { Link } from "react-router-dom";
import {
  Star, UserPlus, FileCheck, Sparkles, Users, Building2,
  Search, PencilLine, Mic, Palette
} from "lucide-react";
import { PortalPageHero } from "../../components/PortalPageHero";
import "../Portal/Portal.css";
import "./ComoFunciona.css";

const PASSOS = [
  { icon: <UserPlus size={22} />, titulo: "1. Você se cadastra", texto: "Na Área do Artista você cria seu cadastro com uma senha, conta sua história, escolhe sua categoria e diz quando tem disponibilidade." },
  { icon: <FileCheck size={22} />, titulo: "2. O Conselho analisa", texto: "Um analista dos Gestores do Conselho Municipal de Políticas Culturais confere as informações e aprova o cadastro." },
  { icon: <Sparkles size={22} />, titulo: "3. Você aparece no catálogo", texto: "Depois de aprovado, seu perfil entra no catálogo público, que qualquer pessoa pode visitar." },
  { icon: <PencilLine size={22} />, titulo: "4. Mantenha seus dados atualizados", texto: "A edição pelo próprio artista está temporariamente indisponível. Para atualizar seu cadastro, entre em contato com a equipe responsável." },
];

const AUDIENCIAS = [
  { icon: <Users size={26} />, titulo: "Para o artista", texto: "Ganhe visibilidade e seja encontrado por quem organiza eventos, festivais e ações culturais na região.", cor: "blue" },
  { icon: <Search size={26} />, titulo: "Para o público e contratantes", texto: "Descubra talentos por categoria, cidade e disponibilidade para contratar e apoiar a cultura local.", cor: "amber" },
  { icon: <Building2 size={26} />, titulo: "Para os Gestores do Conselho Municipal de Políticas Culturais", texto: "Um painel organizado para conhecer os artistas da cidade e apoiar políticas culturais de verdade.", cor: "teal" },
];

export default function ComoFunciona() {
  return (
    <div className="portal-page cf-page">
      <main>
      <PortalPageHero
        eyebrow="GUIA RÁPIDO"
        title="Como funciona o Cadastro de Artistas"
        description="Uma vitrine simples e gratuita para quem faz cultura em Bagé. Entenda o caminho do cadastro até o catálogo."
      />

      {/* ─── O que é ─── */}
      <section className="cf-section">
        <div className="container">
          <div className="cf-card cf-idea">
            <div className="cf-idea-icon"><Palette size={26} /></div>
            <div>
              <h2>Qual é a ideia?</h2>
              <p>
                O <strong>Cadastro Municipal de Artistas</strong> é uma iniciativa dos Gestores do Conselho Municipal de Políticas Culturais de
                Bagé. Ele reúne em um só lugar os artistas da cidade — músicos, pintores, atores,
                fotógrafos, escritores, artesãos e muito mais — para que qualquer pessoa ou empresa
                consiga encontrar um profissional para shows, eventos, exposições e projetos culturais.
              </p>
              <p>
                O artista cria o próprio perfil, os Gestores do Conselho Municipal de Políticas Culturais fazem uma análise rápida e, uma
                vez aprovado, o perfil fica visível para todo mundo. Simples assim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Passos ─── */}
      <section className="cf-section cf-steps-bg">
        <div className="container">
          <h2 className="cf-title">O caminho do seu cadastro</h2>
          <p className="cf-subtitle">Quatro passos, sem burocracia.</p>
          <div className="cf-steps">
            {PASSOS.map((p) => (
              <div key={p.titulo} className="cf-step">
                <div className="cf-step-icon">{p.icon}</div>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Para quem ─── */}
      <section className="cf-section">
        <div className="container">
          <h2 className="cf-title">Para quem é?</h2>
          <p className="cf-subtitle">Todo mundo ganha com a cultura viva na cidade.</p>
          <div className="cf-audiencias">
            {AUDIENCIAS.map((a) => (
              <div key={a.titulo} className={`cf-audiencia cor-${a.cor}`}>
                <div className="cf-audiencia-icon">{a.icon}</div>
                <h3>{a.titulo}</h3>
                <p>{a.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTAs ─── */}
      <section className="cf-section cf-ctas-bg">
        <div className="container">
          <div className="cf-ctas">
            <Link to="/cadastrar" className="btn btn-primary cf-cta-big cf-cta-primary">
              <Mic size={18} /> Quero me cadastrar
            </Link>
            <span className="cf-ou">ou</span>
            <Link to="/artista/login" className="btn btn-outline cf-cta-big cf-cta-secondary">
              Já sou cadastrado(a) — entrar
            </Link>
          </div>
          <p className="cf-aviso">
            A edição pelo próprio artista está temporariamente indisponível.
          </p>
        </div>
      </section>

      </main>
      {/* ─── Footer ─── */}
      <footer className="portal-footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="brand-icon brand-icon-sm"><Star size={13} /></div>
            <span>Cadastro Municipal de Artistas</span>
          </div>
          <p>© 2025 Gestores do Conselho Municipal de Políticas Culturais</p>
          <div className="footer-links">
            <button>Termos de uso</button>
            <button>Privacidade</button>
            <Link to="/feedback">Dar feedback</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
