import { useState } from "react";
import {
  Search, Heart, Eye, MapPin, Music, Theater, Palette, BookOpen,
  Star, ChevronDown, Bell, Settings, BarChart2, Users, Clock,
  CheckCircle, XCircle, AlertCircle, Upload, Link, Video, Headphones,
  Image, ArrowRight, Menu, X, Home, FileText, Tag, Megaphone,
  LogOut, Filter, Download, MoreHorizontal, Plus, ChevronRight,
  Mic, Layers, Award, TrendingUp, User
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ─── Types ──────────────────────────────────────────────────────────────────

type Screen = "catalogo" | "artista" | "admin";
type FormStep = 0 | 1 | 2 | 3;

// ─── Data ────────────────────────────────────────────────────────────────────

const ARTISTS = [
  {
    id: 1,
    name: "Juliana Porto",
    category: "Música",
    city: "Bagé/RS",
    status: "Disponível",
    featured: true,
    bio: "Cantora e compositora com 12 anos de carreira. Especializada em MPB e bossa nova.",
    tags: ["MPB", "Bossa Nova", "Voz e Violão"],
    img: "https://images.unsplash.com/photo-1632054257935-6000d5a39203?w=400&h=400&fit=crop&auto=format",
    rating: 4.9,
    events: 84,
  },
  {
    id: 2,
    name: "Grupo Girassol",
    category: "Teatro",
    city: "Bagé/RS",
    status: "Disponível",
    featured: false,
    bio: "Companhia de teatro independente fundada em 2010. Espetáculos para todas as idades.",
    tags: ["Teatro Adulto", "Teatro Infantil", "Improvisação"],
    img: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&h=400&fit=crop&auto=format",
    rating: 4.7,
    events: 56,
  },
  {
    id: 3,
    name: "André Oliveira",
    category: "Dança",
    city: "Bagé/RS",
    status: "Disponível",
    featured: false,
    bio: "Bailarino e coreógrafo com formação em dança contemporânea e ballet clássico.",
    tags: ["Contemporâneo", "Ballet", "Street Dance"],
    img: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=400&fit=crop&auto=format",
    rating: 4.8,
    events: 41,
  },
  {
    id: 4,
    name: "Fernanda Lima",
    category: "Artes Visuais",
    city: "Bagé/RS",
    status: "Disponível",
    featured: false,
    bio: "Artista plástica com foco em aquarela e instalações urbanas. Expõe em galerias nacionais.",
    tags: ["Aquarela", "Instalação", "Grafite"],
    img: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop&auto=format",
    rating: 4.9,
    events: 29,
  },
  {
    id: 5,
    name: "Carlos Mendes",
    category: "Literatura",
    city: "Bagé/RS",
    status: "Ocupado",
    featured: false,
    bio: "Escritor e contador de histórias. Autor de 5 livros publicados.",
    tags: ["Poesia", "Prosa", "Contação de Histórias"],
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&auto=format",
    rating: 4.6,
    events: 37,
  },
  {
    id: 6,
    name: "Banda Raízes",
    category: "Música",
    city: "Bagé/RS",
    status: "Disponível",
    featured: false,
    bio: "Conjunto musical regional especializado em música gaúcha e chamamé.",
    tags: ["Gaúcha", "Chamamé", "Regional"],
    img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&auto=format",
    rating: 4.5,
    events: 63,
  },
];

const PENDING = [
  { id: 7, name: "Roberto Alves", category: "Circo", city: "Bagé/RS", date: "12/06/2025", status: "Pendente", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format" },
  { id: 8, name: "Cia. Maré Alta", category: "Dança", city: "Bagé/RS", date: "10/06/2025", status: "Em análise", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format" },
  { id: 9, name: "Pablo Soto", category: "Música", city: "Dom Pedrito/RS", date: "08/06/2025", status: "Pendente", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format" },
  { id: 10, name: "Vera Santos", category: "Teatro", city: "Bagé/RS", date: "05/06/2025", status: "Pendente", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&auto=format" },
];

const CHART_DATA = [
  { name: "Música", value: 38, color: "#7C3AED" },
  { name: "Teatro", value: 22, color: "#F97316" },
  { name: "Dança", value: 18, color: "#22C55E" },
  { name: "Artes Vis.", value: 14, color: "#06B6D4" },
  { name: "Literatura", value: 8, color: "#A78BFA" },
];

const FILTERS = ["Todas", "Música", "Teatro", "Dança", "Artes Visuais", "Literatura", "Circo"];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Música: <Music size={14} />,
  Teatro: <Theater size={14} />,
  Dança: <Layers size={14} />,
  "Artes Visuais": <Palette size={14} />,
  Literatura: <BookOpen size={14} />,
  Circo: <Star size={14} />,
};

// ─── Shared Components ───────────────────────────────────────────────────────

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: string }) {
  const styles: Record<string, string> = {
    default: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-cyan-100 text-cyan-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${styles[variant] || styles.default}`}>
      {children}
    </span>
  );
}

function Avatar({ src, alt, size = 40 }: { src: string; alt: string; size?: number }) {
  return (
    <div className="rounded-full overflow-hidden bg-purple-100 flex-shrink-0" style={{ width: size, height: size }}>
      <img src={src} alt={alt} width={size} height={size} className="w-full h-full object-cover" />
    </div>
  );
}

// ─── Screen 1: Catálogo Público ──────────────────────────────────────────────

function CatalogScreen() {
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  const filtered = ARTISTS.filter((a) => {
    const matchesFilter = activeFilter === "Todas" || a.category === activeFilter;
    const matchesSearch =
      search === "" ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const featured = ARTISTS[0];

  return (
    <div className="min-h-screen bg-[#F8F7FF] font-['Inter',sans-serif]">
      {/* Header */}
      <header className="bg-white border-b border-purple-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-md">
              <Star size={16} className="text-white" />
            </div>
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1A1035] text-lg leading-tight">
              Cadastro Municipal<br />
              <span className="text-purple-600 text-sm font-semibold">de Artistas</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7">
            {["Início", "Catálogo", "Como funciona"].map((item) => (
              <button key={item} className={`text-sm font-medium transition-colors ${item === "Catálogo" ? "text-purple-600" : "text-gray-500 hover:text-gray-900"}`}>
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-semibold text-purple-700 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors">
              Sou artista
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-sm">
              Área administrativa
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1A1035] to-[#2D1B69] text-white">
        <div className="max-w-[1440px] mx-auto px-8 py-16 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <Award size={12} /> Plataforma oficial da Prefeitura de Bagé
          </span>
          <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-4xl md:text-5xl font-extrabold leading-tight mb-4 max-w-2xl">
            Descubra talentos<br />
            <span className="text-purple-300">da nossa cidade</span>
          </h1>
          <p className="text-purple-200 text-lg max-w-xl mb-8 leading-relaxed">
            Encontre artistas locais por categoria, cidade e disponibilidade para o seu próximo evento.
          </p>

          {/* Search */}
          <div className="w-full max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, categoria ou palavra-chave..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 pl-12 pr-32 rounded-2xl text-gray-900 text-base shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            />
            <button className="absolute right-2 top-2 h-10 px-5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors">
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-[1440px] mx-auto px-8 py-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-gray-400" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeFilter === f
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-[1440px] mx-auto px-8 pb-16">
        <div className="flex gap-8">
          {/* Artist Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{filtered.length}</span> artistas encontrados
              </p>
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
                Relevância <ChevronDown size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((artist) => (
                <div
                  key={artist.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-purple-50 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                >
                  <div className="relative h-48 bg-purple-100">
                    <img
                      src={artist.img}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setFavorites((f) => f.includes(artist.id) ? f.filter((id) => id !== artist.id) : [...f, artist.id])}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    >
                      <Heart
                        size={15}
                        className={favorites.includes(artist.id) ? "text-red-500 fill-red-500" : "text-gray-400"}
                      />
                    </button>
                    <div className="absolute bottom-3 left-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${artist.status === "Disponível" ? "bg-green-500 text-white" : "bg-orange-500 text-white"}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
                        {artist.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1A1035] text-base">{artist.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        <Star size={12} className="fill-amber-400" />
                        <span className="font-semibold">{artist.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="default">
                        {CATEGORY_ICONS[artist.category]}
                        {artist.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} /> {artist.city}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{artist.bio}</p>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 h-9 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-1">
                        <Eye size={14} /> Ver perfil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar — Destaque */}
          <div className="w-72 flex-shrink-0 space-y-5">
            {/* Featured */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-900 rounded-2xl overflow-hidden shadow-lg text-white">
              <div className="relative h-44">
                <img src={featured.img} alt={featured.name} className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Star size={11} className="fill-white" /> Destaque
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-lg leading-tight">{featured.name}</p>
                  <p className="text-purple-200 text-xs mt-0.5">{featured.category} · {featured.city}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-purple-200 text-xs leading-relaxed mb-3">{featured.bio}</p>
                <div className="flex gap-4 mb-4">
                  <div className="text-center">
                    <p className="font-bold text-xl">{featured.events}</p>
                    <p className="text-purple-300 text-xs">Eventos</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xl">{featured.rating}</p>
                    <p className="text-purple-300 text-xs">Avaliação</p>
                  </div>
                </div>
                <button className="w-full h-9 bg-white text-purple-700 text-sm font-bold rounded-xl hover:bg-purple-50 transition-colors">
                  Ver perfil completo
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1A1035] text-sm mb-4">Números da plataforma</h4>
              {[
                { label: "Artistas cadastrados", value: "142", icon: <Users size={16} className="text-purple-500" /> },
                { label: "Categorias", value: "12", icon: <Tag size={16} className="text-orange-500" /> },
                { label: "Cidades representadas", value: "8", icon: <MapPin size={16} className="text-green-500" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {icon} {label}
                  </div>
                  <span className="font-bold text-[#1A1035]">{value}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
              <Mic size={24} className="text-orange-500 mb-2" />
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-orange-900 text-sm mb-1">É artista?</h4>
              <p className="text-orange-700 text-xs mb-3 leading-relaxed">Cadastre-se e apareça para contratantes e eventos na sua cidade.</p>
              <button className="w-full h-9 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors">
                Fazer cadastro
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1035] text-purple-300 py-8">
        <div className="max-w-[1440px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
              <Star size={13} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-purple-100">Cadastro Municipal de Artistas</span>
          </div>
          <p className="text-xs text-purple-400">© 2025 Prefeitura de Bagé · Secretaria de Cultura</p>
          <div className="flex items-center gap-5 text-xs">
            {["Termos de uso", "Privacidade", "Contato"].map((l) => (
              <button key={l} className="hover:text-purple-100 transition-colors">{l}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Screen 2: Área do Artista ───────────────────────────────────────────────

function ArtistScreen() {
  const [step, setStep] = useState<FormStep>(0);
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);

  const steps = ["Dados básicos", "Atuação", "Portfólio", "Revisão"];

  const toggleAvail = (v: string) =>
    setAvailability((a) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]));

  return (
    <div className="min-h-screen bg-[#F8F7FF] font-['Inter',sans-serif]">
      {/* Header */}
      <header className="bg-white border-b border-purple-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-md">
              <Star size={16} className="text-white" />
            </div>
            <div>
              <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1A1035] text-sm block">Cadastro Municipal de Artistas</span>
              <span className="text-purple-500 text-xs font-medium">Área do Artista</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-500 hover:text-gray-900 font-medium">Sair</button>
            <Avatar src="https://images.unsplash.com/photo-1632054257935-6000d5a39203?w=80&h=80&fit=crop&auto=format" alt="Artista" size={36} />
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-8 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-extrabold text-[#1A1035] mb-1">Painel do Artista</h1>
          <p className="text-gray-500">Complete seu cadastro para fazer parte do catálogo de artistas da sua cidade.</p>
        </div>

        {/* Status card */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 mb-8 max-w-xl">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900">Seu cadastro está em rascunho</p>
            <p className="text-xs text-amber-700">Complete todas as etapas e envie para análise da secretaria.</p>
          </div>
          <div className="ml-auto text-xs text-amber-600 font-semibold bg-amber-100 px-3 py-1 rounded-full">35% concluído</div>
        </div>

        <div className="flex gap-8">
          {/* Form area */}
          <div className="flex-1 max-w-3xl">
            {/* Steps */}
            <div className="flex items-center mb-8">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                  <button
                    onClick={() => setStep(i as FormStep)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      i < step ? "bg-green-500 text-white" : i === step ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "bg-gray-100 text-gray-400"
                    }`}>
                      {i < step ? <CheckCircle size={17} /> : i + 1}
                    </div>
                    <span className={`text-xs font-semibold whitespace-nowrap ${i === step ? "text-purple-700" : "text-gray-400"}`}>{s}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-5 min-w-[40px] ${i < step ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step content */}
            <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-7">
              {step === 0 && (
                <div>
                  <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-[#1A1035] mb-5">Dados básicos</h2>
                  <div className="grid grid-cols-2 gap-5">
                    {[
                      { label: "Nome completo", placeholder: "Seu nome completo", col: 2 },
                      { label: "Nome artístico", placeholder: "Como você é conhecido(a)", col: 1 },
                      { label: "CPF / CNPJ", placeholder: "000.000.000-00", col: 1 },
                      { label: "E-mail", placeholder: "seu@email.com", col: 1 },
                      { label: "Telefone / WhatsApp", placeholder: "(53) 99999-0000", col: 1 },
                      { label: "Cidade", placeholder: "Bagé/RS", col: 1 },
                    ].map(({ label, placeholder, col }) => (
                      <div key={label} className={col === 2 ? "col-span-2" : ""}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                        <input
                          placeholder={placeholder}
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50 focus:bg-white transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-[#1A1035] mb-5">Atuação artística</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Categoria artística</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["Música", "Teatro", "Dança", "Artes Visuais", "Literatura", "Circo"].map((c) => (
                          <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={`h-11 px-4 rounded-xl text-sm font-semibold border transition-all flex items-center gap-2 justify-center ${
                              category === c ? "bg-purple-600 text-white border-purple-600" : "border-gray-200 text-gray-600 hover:border-purple-300"
                            }`}
                          >
                            {CATEGORY_ICONS[c]} {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descrição do trabalho</label>
                      <textarea
                        rows={4}
                        placeholder="Descreva sua arte, experiência e tipo de apresentação que você oferece..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50 focus:bg-white resize-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tags / palavras-chave</label>
                      <input placeholder="Ex: MPB, Acústico, Shows ao vivo..." className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">Disponibilidade para apresentações</label>
                      <div className="flex flex-wrap gap-2">
                        {["Fins de semana", "Dias úteis", "Feriados", "Eventos noturnos", "Eventos diurnos"].map((v) => (
                          <button
                            key={v}
                            onClick={() => toggleAvail(v)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                              availability.includes(v) ? "bg-green-500 text-white border-green-500" : "border-gray-200 text-gray-600 hover:border-green-400"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-[#1A1035] mb-5">Portfólio</h2>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { icon: <Image size={22} />, label: "Fotos", desc: "JPG, PNG até 10MB" },
                      { icon: <Video size={22} />, label: "Vídeos", desc: "MP4, até 100MB ou link do YouTube" },
                      { icon: <Headphones size={22} />, label: "Áudios", desc: "MP3, WAV até 50MB" },
                      { icon: <Link size={22} />, label: "Links externos", desc: "YouTube, Spotify, Instagram..." },
                    ].map(({ icon, label, desc }) => (
                      <button key={label} className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group text-left">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                          {icon}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{label}</p>
                          <p className="text-xs text-gray-400">{desc}</p>
                        </div>
                        <Plus size={16} className="ml-auto text-gray-400 group-hover:text-purple-600" />
                      </button>
                    ))}
                  </div>

                  <div className="border-2 border-dashed border-purple-200 rounded-2xl p-10 text-center bg-purple-50/50 hover:bg-purple-50 transition-colors cursor-pointer">
                    <Upload size={36} className="text-purple-400 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700 mb-1">Arraste e solte seus arquivos aqui</p>
                    <p className="text-xs text-gray-400 mb-4">ou clique para selecionar arquivos do seu dispositivo</p>
                    <button className="px-6 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors">
                      Selecionar arquivos
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-xl text-[#1A1035] mb-2">Revisão do cadastro</h2>
                  <p className="text-gray-500 text-sm mb-6">Confira seus dados antes de enviar para análise.</p>
                  <div className="space-y-3">
                    {[
                      { section: "Dados básicos", items: ["Nome: Juliana Porto", "E-mail: juliana@email.com", "Cidade: Bagé/RS"], ok: true },
                      { section: "Atuação", items: ["Categoria: Música", "Tags: MPB, Bossa Nova"], ok: true },
                      { section: "Portfólio", items: ["2 fotos enviadas"], ok: false },
                    ].map(({ section, items, ok }) => (
                      <div key={section} className={`rounded-xl border p-4 ${ok ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {ok ? <CheckCircle size={16} className="text-green-600" /> : <AlertCircle size={16} className="text-amber-600" />}
                          <span className="font-semibold text-sm text-gray-800">{section}</span>
                        </div>
                        <ul className="space-y-0.5 ml-5">
                          {items.map((item) => (
                            <li key={item} className="text-xs text-gray-600">{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1) as FormStep)}
                disabled={step === 0}
                className="px-6 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:border-gray-300 disabled:opacity-40 transition-colors"
              >
                Voltar
              </button>
              <div className="flex items-center gap-3">
                <button className="px-6 py-2.5 text-sm font-semibold text-purple-700 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors">
                  Salvar rascunho
                </button>
                {step < 3 ? (
                  <button
                    onClick={() => setStep((s) => Math.min(3, s + 1) as FormStep)}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    Próxima etapa <ArrowRight size={16} />
                  </button>
                ) : (
                  <button className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2">
                    <CheckCircle size={16} /> Enviar para análise
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-24">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Prévia do perfil</p>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-purple-50">
                <div className="h-32 bg-gradient-to-br from-purple-400 to-purple-700 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <User size={28} className="text-white/60" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    {category && (
                      <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        {CATEGORY_ICONS[category]} {category}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1A1035] text-sm mb-0.5">Juliana Porto</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-3"><MapPin size={11} /> Bagé/RS</p>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">Cantora e compositora com 12 anos de carreira.</p>
                  {availability.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {availability.slice(0, 2).map((a) => (
                        <span key={a} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{a}</span>
                      ))}
                    </div>
                  )}
                  <div className="w-full h-8 bg-purple-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                    Ver perfil
                  </div>
                </div>
              </div>
              <div className="mt-3 bg-purple-50 rounded-xl p-3 text-xs text-purple-700 leading-relaxed">
                <strong>Dica:</strong> perfis com foto, vídeo e descrição completa recebem até 3x mais contatos.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 3: Admin ─────────────────────────────────────────────────────────

function AdminScreen() {
  const [selected, setSelected] = useState(PENDING[0]);
  const [activeMenu, setActiveMenu] = useState("Pendentes");

  const menuItems = [
    { icon: <Home size={17} />, label: "Dashboard" },
    { icon: <Users size={17} />, label: "Artistas" },
    { icon: <Clock size={17} />, label: "Pendentes", badge: 4 },
    { icon: <Tag size={17} />, label: "Categorias" },
    { icon: <BarChart2 size={17} />, label: "Relatórios" },
    { icon: <Megaphone size={17} />, label: "Comunicados" },
    { icon: <Settings size={17} />, label: "Configurações" },
  ];

  const stats = [
    { label: "Total de artistas", value: "142", icon: <Users size={20} />, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Pendentes", value: "4", icon: <Clock size={20} />, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Aprovados", value: "131", icon: <CheckCircle size={20} />, color: "text-green-600", bg: "bg-green-100" },
    { label: "Categorias", value: "12", icon: <Tag size={20} />, color: "text-cyan-600", bg: "bg-cyan-100" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FF] font-['Inter',sans-serif] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1A1035] flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-purple-900/50">
          <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
            <Star size={13} className="text-white" />
          </div>
          <div>
            <p className="text-white text-xs font-bold leading-tight">Cadastro Municipal</p>
            <p className="text-purple-400 text-[10px]">Área administrativa</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 mt-2">
          {menuItems.map(({ icon, label, badge }) => (
            <button
              key={label}
              onClick={() => setActiveMenu(label)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeMenu === label
                  ? "bg-purple-600 text-white"
                  : "text-purple-300 hover:bg-purple-900/50 hover:text-white"
              }`}
            >
              {icon}
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-purple-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">SM</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">Secretaria Municipal</p>
              <p className="text-purple-400 text-[10px]">Administrador</p>
            </div>
            <button className="text-purple-400 hover:text-white transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-purple-100 h-16 flex items-center px-8 gap-4 flex-shrink-0 shadow-sm">
          <div className="flex-1">
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1A1035] text-lg">Painel Administrativo</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50">
              <Download size={15} /> Exportar
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-7">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-5 mb-7">
            {stats.map(({ label, value, icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center ${color}`}>{icon}</div>
                <div>
                  <p className="text-2xl font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-[#1A1035]">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-6">
            {/* Left column: table + chart */}
            <div className="flex-1 space-y-6">
              {/* Pending table */}
              <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1A1035] text-base">Cadastros pendentes</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Aguardando revisão da secretaria</p>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50">
                    <Filter size={13} /> Filtrar
                  </button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Artista", "Categoria", "Cidade", "Data", "Status", "Ações"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-400 px-6 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PENDING.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => setSelected(p)}
                        className={`border-b border-gray-50 cursor-pointer transition-colors ${selected.id === p.id ? "bg-purple-50" : "hover:bg-gray-50"}`}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar src={p.img} alt={p.name} size={34} />
                            <span className="font-semibold text-sm text-[#1A1035]">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant="default">{p.category}</Badge>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500 flex items-center gap-1">
                          <MapPin size={12} className="text-gray-300" /> {p.city}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">{p.date}</td>
                        <td className="px-6 py-3">
                          <Badge variant={p.status === "Em análise" ? "blue" : "orange"}>{p.status}</Badge>
                        </td>
                        <td className="px-6 py-3">
                          <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp size={18} className="text-purple-600" />
                  <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1A1035] text-base">Artistas por categoria</h2>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={CHART_DATA} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F0FF" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid #EDE9FE", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}
                      cursor={{ fill: "#F3F0FF" }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {CHART_DATA.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Review panel */}
            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-hidden sticky top-0">
                <div className="p-5 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Revisão do cadastro</p>
                  <div className="flex items-center gap-3">
                    <Avatar src={selected.img} alt={selected.name} size={52} />
                    <div>
                      <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[#1A1035] text-sm">{selected.name}</p>
                      <Badge variant="default">{selected.category}</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-2">Informações principais</p>
                    {[
                      { label: "Cidade", value: selected.city },
                      { label: "Cadastrado em", value: selected.date },
                      { label: "Status", value: selected.status },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between py-1.5 border-b border-gray-50">
                        <span className="text-xs text-gray-500">{label}</span>
                        <span className="text-xs font-semibold text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-2">Descrição</p>
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">
                      Artista com experiência em apresentações ao vivo. Busca oportunidades em eventos culturais da cidade.
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-2">Portfólio enviado</p>
                    <div className="flex gap-2">
                      {[1, 2].map((n) => (
                        <div key={n} className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
                          <Image size={20} className="text-purple-400" />
                        </div>
                      ))}
                      <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Video size={20} className="text-orange-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2">
                  <button className="w-full h-10 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle size={15} /> Aprovar
                  </button>
                  <button className="w-full h-10 bg-amber-50 text-amber-700 border border-amber-200 text-sm font-bold rounded-xl hover:bg-amber-100 transition-colors flex items-center justify-center gap-2">
                    <AlertCircle size={15} /> Solicitar ajuste
                  </button>
                  <button className="w-full h-10 bg-red-50 text-red-700 border border-red-200 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                    <XCircle size={15} /> Rejeitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("catalogo");

  const tabs: { id: Screen; label: string; desc: string }[] = [
    { id: "catalogo", label: "Tela 1", desc: "Catálogo Público" },
    { id: "artista", label: "Tela 2", desc: "Área do Artista" },
    { id: "admin", label: "Tela 3", desc: "Área Administrativa" },
  ];

  return (
    <div className="min-h-screen bg-[#0F0921] flex flex-col">
      {/* Frame selector */}
      <div className="flex-shrink-0 px-8 py-4 flex items-center gap-2">
        <span className="text-purple-400 text-xs font-semibold uppercase tracking-widest mr-3">Protótipo UI/UX —</span>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setScreen(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              screen === tab.id
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50"
                : "text-purple-400 border border-purple-800/50 hover:border-purple-600 hover:text-purple-200"
            }`}
          >
            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${screen === tab.id ? "bg-white/20" : "bg-purple-800/50"}`}>
              {tab.id === "catalogo" ? "1" : tab.id === "artista" ? "2" : "3"}
            </span>
            {tab.desc}
          </button>
        ))}
      </div>

      {/* Frame container */}
      <div className="flex-1 px-4 pb-4">
        <div className="rounded-2xl overflow-hidden border border-purple-800/30 shadow-2xl shadow-purple-950/50">
          {screen === "catalogo" && <CatalogScreen />}
          {screen === "artista" && <ArtistScreen />}
          {screen === "admin" && <AdminScreen />}
        </div>
      </div>
    </div>
  );
}
