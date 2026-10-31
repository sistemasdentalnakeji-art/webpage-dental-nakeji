import { useLang } from '@/app/lang'
import { SITE } from '@/config/site'
import { UI } from '@/data/ui'
import { Icon } from '@/components/ui/Icon'
import { BLOG_DATE, formatDate, keyOf, photoOf, photoSrcSetOf, readingMinutes, type Article } from '@/pages/blog/blogData'

interface BlogCardProps {
  article: Article
  excerpt: string
  /** Nivel del título: 3 bajo un h2 de sección, 4 dentro de un grupo con h3 (portada). */
  level?: 3 | 4
  /** Tema al pie: se oculta donde ya se lee (estantes de la portada y página de la categoría). */
  showTopic?: boolean
}

/** Tarjeta de artículo: foto del servicio; fecha y minutos de lectura arriba, título y extracto; al pie, logo y tema.
 * Con el cursor encima solo cambia el degradado de la foto (blog.css). */
export function BlogCard({ article, excerpt, level = 3, showTopic = true }: BlogCardProps) {
  const ui = UI[useLang()].blog
  const key = keyOf(article)
  const Title = level === 3 ? 'h3' : 'h4'
  return (
    <a className="blog-card" href={article.route}>
      <div className="blog-card__frame">
        <div className="blog-card__media">
          <img
            className="blog-card__img"
            src={photoOf(key)}
            srcSet={photoSrcSetOf(key)}
            sizes="(max-width: 599.98px) 100vw, (max-width: 959.98px) 50vw, 400px"
            alt=""
            width={1280}
            height={720}
            loading="lazy"
          />
          <div className="blog-card__shade" />
        </div>
        <div className="blog-card__body">
          <p className="blog-card__stamp">
            <span className="blog-card__date">{formatDate(BLOG_DATE, ui.dateLocale)}</span>
            <span className="blog-card__time">
              <Icon name="clock" size={14} />
              {ui.minutes(readingMinutes(article))}
            </span>
          </p>
          <Title className="blog-card__title">{article.title}</Title>
          <p className="blog-card__excerpt">{excerpt}</p>
        </div>
        <div className="blog-card__meta">
          <img className="blog-card__brand" src={SITE.logo.src} alt="" width={SITE.logo.width} height={SITE.logo.height} />
          {showTopic && <span className="blog-card__topic">{article.category}</span>}
        </div>
      </div>
    </a>
  )
}
