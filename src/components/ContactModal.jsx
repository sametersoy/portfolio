import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const EMAIL = 'sametersoy@yandex.com'

export default function ContactModal({ open, onClose }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  if (!open) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="modal" onClick={onClose} role="dialog" aria-modal="true" aria-label={t('contact.heading')}>
      <div className="modal__card" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label={t('panel.close')}>✕</button>
        <h2 className="modal__title">{t('contact.heading')}</h2>
        <p className="modal__text">{t('contact.text')}</p>

        <div className="modal__email">
          <span className="modal__email-dot" />
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>

        <div className="modal__actions">
          <a className="btn btn--primary" href={`mailto:${EMAIL}`}>
            ✉ {t('contact.email')}
          </a>
          <button className="btn" onClick={copy}>
            {copied ? `✓ ${t('contact.copied')}` : `⧉ ${t('contact.copy')}`}
          </button>
        </div>
      </div>
    </div>
  )
}
