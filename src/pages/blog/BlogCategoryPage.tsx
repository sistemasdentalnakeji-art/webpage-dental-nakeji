import { Band } from '@/components/decor/Band'
import { PagePlasma } from '@/components/decor/PagePlasma'
import { routeOf, type RouteDef } from '@/config/routes'
import { UI } from '@/data/ui'
import { BlogCard } from '@/pages/blog/BlogCard'
import { BlogCrumbs } from '@/pages/blog/BlogCrumbs'
import { articlesIn, BLOG, excerptOf, type Category } from '@/pages/blog/blogData'
import { TextBlurReveal } from '@/components/ui/TextBlurReveal'

/** Categoría del blog: cabecera (migas, título e introducción), sus tarjetas y una tira con los otros temas. */
export function BlogCategoryPage({ route, category }: { route: RouteDef; category: Category }) {
  const { lang } = route
  const ui = UI[lang].blog
  const list = articlesIn(lang, category)
  const others = BLOG[lang].categories.filter((c) => c.route !== category.route)
  return (
    <>
      <Band tone="gradient" labelledBy="blog-categoria" className="blog-head blog-dark band--clip" decor={<PagePlasma />}>
        <div className="container blog-hero blog-hero--single">
          <div>
            <BlogCrumbs trail={[{ label: 'Blog', href: routeOf('blog', lang).path }, { label: category.name }]} />
            <h1 id="blog-categoria" className="blog-hero__title shiny-text">
              <TextBlurReveal text={category.name} />
            </h1>
            <p className="blog-hero__intro">{category.intro}</p>
          </div>
        </div>

        <section className="container blog-library" aria-labelledby="blog-categoria-articulos">
          <h2 id="blog-categoria-articulos" className="blog-more__title">
            {ui.inCategory}
          </h2>
          <div className="blog-grid blog-grid--flush">
            {list.map((a) => (
              <BlogCard key={a.route} article={a} excerpt={excerptOf(lang, a.route)} showTopic={false} />
            ))}
          </div>
        </section>

        <section className="container blog-library" aria-labelledby="blog-otros-temas">
          <h2 id="blog-otros-temas" className="blog-more__title">
            {ui.moreTopics}
          </h2>
          <ul className="blog-topics">
            {others.map((c) => (
              <li key={c.route}>
                <a className="blog-topic" href={c.route}>
                  <span className="blog-topic__name">{c.name}</span>
                  <span className="blog-topic__text">{c.description}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </Band>
    </>
  )
}
