// TEXTOS DE LA PÁGINA /beneficios/ (componente: pages/benefits/BenefitsPage.tsx), en inglés (en) y español (es).
//
// • Encabezado: BENEFITS_HERO (titular y lista de beneficios).
// • Tarjetas: BENEFIT_CARDS, en el orden en que se muestran. Cada una enlaza a su página (routes.ts).
//   Promociones aún no tiene contenido: lleva "Próximamente" / "Coming soon".
// • Estilos → src/styles/pages/benefits.css.
// Todo es provisional: no hay promociones, descuentos ni cobertura confirmados.
// Pendiente confirmar con la clínica: que informa costos antes de cada tratamiento y que orienta sobre seguros y convenios.
// Equivalencias del inglés: gan-harness/glosario-en.md.

import type { IconName } from '@/components/ui/Icon'
import { LANGS, routeOf, type Lang } from '@/config/routes'

export interface BenefitCard {
  id: string
  title: string
  text: string
  icon: IconName
  href: string
  /** Etiqueta opcional (p. ej. "Próximamente"). */
  badge?: string
}

export const BENEFITS_HERO: Record<
  Lang,
  { eyebrow: string; titleLead: string; titleAccent: string; lead: string; features: { icon: IconName; text: string }[] }
> = {
  en: {
    eyebrow: 'Benefits',
    titleLead: 'We don’t just care for your smile,',
    titleAccent: 'we also care about your wallet.',
    lead: 'We explain your options clearly so you can look after your dental health without overspending.',
    // PENDIENTE (clínica): confirmar que informa costos antes de cada tratamiento y que orienta sobre seguros y convenios.
    features: [
      { icon: 'drop', text: 'Clear costs before each treatment' },
      { icon: 'check', text: 'Timely prevention to avoid bigger expenses' },
      { icon: 'users', text: 'Options that fit you and your budget' },
      { icon: 'shield', text: 'Guidance on your insurance or company agreement' },
    ],
  },
  es: {
    eyebrow: 'Beneficios',
    titleLead: 'No solo cuidamos tu sonrisa,',
    titleAccent: 'también cuidamos tu dinero.',
    lead: 'Te explicamos tus opciones con claridad para que cuides tu salud dental sin gastar de más.',
    features: [
      { icon: 'drop', text: 'Costos claros antes de cada tratamiento' },
      { icon: 'check', text: 'Prevención a tiempo para evitar gastos mayores' },
      { icon: 'users', text: 'Opciones a tu medida y tu presupuesto' },
      { icon: 'shield', text: 'Orientación sobre tu seguro o convenio' },
    ],
  },
}

const buildCards = (lang: Lang): BenefitCard[] => {
  const en = lang === 'en'
  return [
    {
      id: 'promociones',
      title: en ? 'Promotions' : 'Promociones',
      text: en
        ? 'When we have promotions, we will announce them here. For now, ask us on WhatsApp.'
        : 'Cuando tengamos promociones, las daremos a conocer aquí. Por ahora, pregúntanos por WhatsApp.',
      icon: 'sparkle',
      href: routeOf('promotions', lang).path,
      badge: en ? 'Coming soon' : 'Próximamente',
    },
    {
      id: 'aseguranzas',
      title: en ? 'US insurance plans' : 'Aseguranzas americanas',
      // "Aceptamos aseguranzas americanas" está publicado en el sitio oficial.
      text: en
        ? 'We accept US dental insurance plans. Contact us before your appointment and we’ll answer your questions.'
        : 'Aceptamos aseguranzas americanas. Consúltanos antes de tu cita para resolver tus dudas.',
      icon: 'shield',
      href: routeOf('insurance', lang).path,
    },
    {
      id: 'convenios',
      title: en ? 'Partner companies' : 'Convenios con empresas',
      text: en
        ? 'Does your company have or want a dental agreement? Message us and we will go over your options together.'
        : '¿Tu empresa tiene o quiere un convenio dental? Escríbenos y revisamos juntos tus opciones.',
      icon: 'building',
      href: routeOf('agreements', lang).path,
    },
  ]
}

export const BENEFIT_CARDS = Object.fromEntries(LANGS.map((lang) => [lang, buildCards(lang)])) as Record<Lang, BenefitCard[]>

export const BENEFIT_CARDS_CTA: Record<Lang, string> = { en: 'See options', es: 'Consultar opciones' }

export const BENEFITS_CTA: Record<Lang, { title: string; text: string; label: string }> = {
  en: {
    title: 'Questions about your coverage?',
    text: 'Message us on WhatsApp and we will tell you whether your plan or your company qualifies.',
    label: 'Message us on WhatsApp',
  },
  es: {
    title: '¿Tienes dudas sobre tu cobertura?',
    text: 'Escríbenos por WhatsApp y te decimos si tu plan o tu empresa aplican.',
    label: 'Escribir por WhatsApp',
  },
}
