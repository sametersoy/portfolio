import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// Keeps <title> and meta description in sync with the active language for SEO.
export default function SeoSync() {
  const { t, i18n } = useTranslation()
  useEffect(() => {
    document.title = t('meta.title')
    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', t('meta.description'))
    const og = document.querySelector('meta[property="og:title"]')
    if (og) og.setAttribute('content', t('meta.title'))
  }, [t, i18n.language])
  return null
}
