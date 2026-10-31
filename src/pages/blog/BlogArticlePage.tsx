import { Fragment, useEffect, useMemo, useState } from 'react'
import { Band } from '@/components/decor/Band'
import { PagePlasma } from '@/components/decor/PagePlasma'
import { ChapterScrubber } from '@/components/ui/ChapterScrubber'
import { Icon } from '@/components/ui/Icon'
import { routeOf, scheduleHref, type RouteDef } from '@/config/routes'
import { UI } from '@/data/ui'
import { BlogCard } from '@/pages/blog/BlogCard'
import { BlogCrumbs } from '@/pages/blog/BlogCrumbs'
import {
  articlesIn,
  BLOG,
  BLOG_DATE,
  excerptOf,
  formatDate,
  keyOf,
  linksIn,
  paragraphsOf,
  photoOf,
  photoSrcSetOf,
  readingMinutes,
  type Article,
} from '@/pages/blog/blogData'
import { TextBlurReveal } from '@/components/ui/TextBlurReveal'

/** Enlaces de una línea del .md ("[texto](url); [texto](url)"), separados por punto y coma. */
function Links({ text }: { text: string }) {
  return linksIn(text).map((l, i) => (
    <Fragment key={`${l.href}-${i}`}>
      {i > 0 && '; '}
      <a href={l.href}>{l.label}</a>
    </Fragment>
  ))
}

/**
 * Artículo: cabecera (migas, tema, titular, entradilla, fecha y minutos, foto del servicio), respuesta breve, secciones en tarjetas
 * desplegables (la primera abierta) con riel de capítulos, cierre (fuentes y CTA) y "Más de este tema" con los otros artículos de su categoría.
 */
export function BlogArticlePage({ route, article }: { route: RouteDef; article: Article }) {
  const { lang } = route
  const ui = UI[lang].blog
  const key = keyOf(article)
  const category = BLOG[lang].categories.find((c) => c.name === article.category)
  const more = category ? articlesIn(lang, category).filter((a) => a.route !== article.route) : []
  // Tarjetas abiertas (índices): la primera al entrar. El riel de capítulos y los enlaces con #seccion-N abren la que señalan.
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]))
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (!next.delete(i)) next.add(i)
      return next
    })
  useEffect(() => {
    const reveal = () => {
      const hit = /^#seccion-(\d+)$/.exec(window.location.hash)
      if (hit) setOpen((prev) => new Set(prev).add(Number(hit[1]) - 1))
    }
    reveal()
    window.addEventListener('hashchange', reveal)
    return () => window.removeEventListener('hashchange', reveal)
  }, [])
  const chapters = useMemo(() => article.sections.map((s, i) => ({ id: `seccion-${i + 1}`, title: s.title })), [article])
  const trail: { label: string; href?: string }[] = [{ label: 'Blog', href: routeOf('blog', lang).path }]
  if (category) trail.push({ label: category.name, href: category.route })
  trail.push({ label: article.title })

  return (
    <>
      {/* Una sola banda (degradado fijo + plasma) para toda la página: el fondo es continuo, sin costuras entre secciones. */}
      <Band tone="gradient" labelledBy="articulo-titulo" className="blog-head blog-dark band--clip" decor={<PagePlasma />}>
        <div className="container blog-article-head">
          <div className="blog-article-head__text">
            <BlogCrumbs trail={trail} />
            <p className="blog-kicker">{article.category}</p>
            <h1 id="articulo-titulo" className="blog-article__title shiny-text">
              <TextBlurReveal text={article.title} />
            </h1>
            <p className="blog-article__lead">{article.lead}</p>
            <p className="blog-article__stamp">
              <span>{formatDate(BLOG_DATE, ui.dateLocale)}</span>
              <span className="blog-article__time">
                <Icon name="clock" size={16} />
                {ui.minutes(readingMinutes(article))}
              </span>
            </p>
          </div>
          <figure className="blog-article-head__photo">
            <img
              className="blog-article-head__img"
              src={photoOf(key)}
              srcSet={photoSrcSetOf(key)}
              sizes="(max-width: 960px) 100vw, 560px"
              alt=""
              fetchPriority="high"
              width={1280}
              height={720}
            />
          </figure>
        </div>

        <div className="container blog-article">
          <div className="blog-article__body" role="region" aria-labelledby="articulo-titulo">
            <p className="blog-answer">
              <strong id="articulo-respuesta">{ui.answer}</strong> {article.answer}
            </p>
            {article.sections.map((s, i) => (
              <section
                key={chapters[i].id}
                id={chapters[i].id}
                className="blog-article__section"
                data-open={open.has(i) ? '' : undefined}
                aria-labelledby={`${chapters[i].id}-titulo`}
              >
                <header className="blog-article__head">
                  <h2 id={`${chapters[i].id}-titulo`} className="blog-article__h2">
                    {s.title}
                  </h2>
                  <button
                    type="button"
                    className="blog-article__toggle"
                    aria-expanded={open.has(i)}
                    aria-controls={`${chapters[i].id}-texto`}
                    aria-labelledby={`${chapters[i].id}-titulo`}
                    onClick={() => toggle(i)}
                  />
                </header>
                <div id={`${chapters[i].id}-texto`} className="blog-article__text" hidden={!open.has(i)}>
                  {paragraphsOf(s).map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
            <div className="blog-article__end">
              <p className="blog-article__meta">
                <strong>{ui.sources}</strong> <Links text={article.sources} />.
              </p>
              <a className="btn btn--primary" href={scheduleHref(route)}>
                {ui.book}
              </a>
            </div>
          </div>
          <ChapterScrubber chapters={chapters} label={ui.chapters} />
        </div>

        {more.length > 0 && (
          <section className="container blog-library" aria-labelledby="articulo-mas">
            <h2 id="articulo-mas" className="blog-more__title">
              {ui.moreInTopic}
            </h2>
            <div className="blog-grid">
              {more.map((a) => (
                <BlogCard key={a.route} article={a} excerpt={excerptOf(lang, a.route)} />
              ))}
            </div>
          </section>
        )}
      </Band>
    </>
  )
}
