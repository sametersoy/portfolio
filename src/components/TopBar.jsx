import { useTranslation } from 'react-i18next'
import LanguageSwitch from './LanguageSwitch.jsx'
import Clock from './Clock.jsx'

export default function TopBar({ onReset, onCareer, onContact }) {
  const { t } = useTranslation()
  return (
    <header className="topbar">
      <button className="brand" onClick={onReset} aria-label="Samet Ersoy">
        <span className="brand__mark">SE</span>
        <span className="brand__text">
          <strong>Samet Ersoy</strong>
          <small>{t('hero.role')}</small>
        </span>
      </button>

      <nav className="topnav">
        <button onClick={onReset}>{t('nav.skills')}</button>
        <button onClick={onCareer}>{t('nav.timeline')}</button>
        <button onClick={onContact}>{t('nav.contact')}</button>
      </nav>

      <div className="topbar__right">
        <Clock />
        <LanguageSwitch />
      </div>
    </header>
  )
}
