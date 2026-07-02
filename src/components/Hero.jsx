import { useTranslation } from 'react-i18next'

export default function Hero({ hidden }) {
  const { t } = useTranslation()
  return (
    <section className={hidden ? 'hero is-hidden' : 'hero'} aria-hidden={hidden}>
      <p className="hero__role">{t('hero.role')}</p>
      <h1 className="hero__name">{t('hero.name')}</h1>
      <p className="hero__tagline">{t('hero.tagline')}</p>
      <p className="hero__summary">{t('hero.summary')}</p>
      <p className="hero__hint">
        <span className="hero__hint-dot" />
        {t('hero.hint')}
      </p>
    </section>
  )
}
