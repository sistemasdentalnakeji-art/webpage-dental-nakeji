import { Band } from '@/components/decor/Band'
import { PagePlasma } from '@/components/decor/PagePlasma'
import { routeOf, scheduleHref, type RouteDef } from '@/config/routes'
import { UI } from '@/data/ui'
import { BlogCard } from '@/pages/blog/BlogCard'
import { articlesIn, BLOG, excerptOf, keyOf } from '@/pages/blog/blogData'
import { TextBlurReveal } from '@/components/ui/TextBlurReveal'

/**
 * Portada del blog: cabecera con el índice de temas, la biblioteca de artículos agrupada por tema (con una barra de temas
 * que se queda fija al bajar) y el bloque final para agendar.
 */
export function BlogPage({ route }: { route: RouteDef }) {
  const { lang } = route
  const ui = UI[lang].blog
  const { hub, categories } = BLOG[lang]
  return (
    <>
      {/* Una sola banda (degradado fijo + plasma) para toda la página: el fondo es continuo, sin costuras entre secciones. */}
      <Band tone="gradient" labelledBy="blog-titulo" className="blog-head blog-dark band--clip" decor={<PagePlasma />}>
        <div className="container blog-hero">
          <div>
            <p className="blog-kicker">{hub.label}</p>
            <h1 id="blog-titulo" className="blog-hero__title shiny-text">
              <TextBlurReveal text={hub.h1} />
            </h1>
            <p className="blog-hero__intro">{hub.intro}</p>
            <div className="blog-hero__actions">
              <a className="btn btn--primary" href="#articulos">
                {ui.explore}
              </a>
              <a className="btn btn--ghost" href={routeOf('services', lang).path}>
                {ui.allServices}
              </a>
            </div>
          </div>

          <nav className="blog-index blog-index--hub" aria-labelledby="blog-temas">
            <h2 id="blog-temas" className="blog-index__title">
              {hub.exploreTitle}
            </h2>
            <p className="blog-index__text">{hub.exploreText}</p>
            <ul className="blog-index__list">
              {categories.map((c) => (
                <li key={c.route}>
                  <a className="blog-index__link" href={c.route}>
                    <span className="blog-index__name">{c.name}</span>
                    <span className="blog-index__count">{ui.articleCount(articlesIn(lang, c).length)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <section className="container blog-library" id="articulos" aria-labelledby="blog-articulos">
          <h2 id="blog-articulos" className="section-title">
            {hub.featuredText}
          </h2>
          <p className="section-text">{hub.featuredLead}</p>

          <nav className="blog-chips" aria-label={ui.topicsNav}>
            <ul>
              {categories.map((c) => (
                <li key={c.route}>
                  <a href={`#tema-${keyOf(c)}`}>{c.name}</a>
                </li>
              ))}
            </ul>
          </nav>

          {categories.map((c) => (
            <section key={c.route} id={`tema-${keyOf(c)}`} className="blog-shelf" aria-labelledby={`tema-${keyOf(c)}-titulo`}>
              <div className="blog-shelf__head">
                <h3 id={`tema-${keyOf(c)}-titulo`} className="blog-shelf__title">
                  <a href={c.route}>{c.name}</a>
                </h3>
                <p className="blog-shelf__text">{c.description}</p>
              </div>
              <div className="blog-grid">
                {articlesIn(lang, c).map((a) => (
                  <BlogCard key={a.route} article={a} excerpt={excerptOf(lang, a.route)} level={4} showTopic={false} />
                ))}
              </div>
            </section>
          ))}
        </section>

        <section className="container blog-cta" aria-labelledby="blog-cta">
          <h2 id="blog-cta" className="blog-cta__title">
            {hub.ctaTitle}
          </h2>
          <p className="blog-cta__text">{hub.ctaText}</p>
          <a className="btn btn--primary" href={scheduleHref(route)}>
            {ui.book}
          </a>
        </section>
      </Band>
    </>
  )
}
