import "./PortalPageHero.css";

interface PortalPageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PortalPageHero({ eyebrow, title, description }: PortalPageHeroProps) {
  return (
    <section className="portal-page-hero" aria-labelledby="portal-page-hero-title">
      <img className="portal-page-hero-image" src="/bage-catalog-hero.webp" alt="" aria-hidden="true" />
      <div className="portal-page-hero-wash" aria-hidden="true" />
      <div className="container portal-page-hero-content">
        <p className="portal-page-hero-eyebrow">{eyebrow}</p>
        <h1 id="portal-page-hero-title">{title}</h1>
        <p className="portal-page-hero-description">{description}</p>
      </div>
    </section>
  );
}
