import { useTranslation } from 'react-i18next'

export default function LanguageSwitch() {
  const { i18n } = useTranslation()
  const current = i18n.language?.startsWith('tr') ? 'tr' : 'en'

  const set = (lng) => i18n.changeLanguage(lng)

  return (
    <div className="lang" role="group" aria-label="Language">
      <button
        className={current === 'tr' ? 'lang__btn is-active' : 'lang__btn'}
        onClick={() => set('tr')}
        aria-pressed={current === 'tr'}
      >
        TR
      </button>
      <span className="lang__sep" />
      <button
        className={current === 'en' ? 'lang__btn is-active' : 'lang__btn'}
        onClick={() => set('en')}
        aria-pressed={current === 'en'}
      >
        EN
      </button>
    </div>
  )
}
