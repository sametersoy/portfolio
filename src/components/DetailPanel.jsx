import { useTranslation } from 'react-i18next'

export default function DetailPanel({ unit, onClose }) {
  const { t } = useTranslation()
  if (!unit) return null

  return (
    <aside className="detail" style={{ '--accent': unit.accent }} role="dialog" aria-label={t(`units.${unit.id}.title`)}>
      <button className="detail__close" onClick={onClose} aria-label={t('panel.close')}>
        ✕
      </button>
      <div className="detail__head">
        <span className="detail__icon">{unit.icon}</span>
        <h2 className="detail__title">{t(`units.${unit.id}.title`)}</h2>
      </div>
      <p className="detail__desc">{t(`units.${unit.id}.desc`)}</p>

      <p className="detail__label">{t('panel.stack')}</p>
      <ul className="detail__stack">
        {unit.items.map((item) => (
          <li key={item} className="chip">
            <span className="chip__led" />
            {item}
          </li>
        ))}
      </ul>
    </aside>
  )
}
