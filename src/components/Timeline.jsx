import { useTranslation } from 'react-i18next'
import { TIMELINE } from '../data/timeline.js'

export default function Timeline({ expanded, hidden, onToggle }) {
  const { t } = useTranslation()
  const cls = [
    'timeline',
    expanded ? 'is-expanded' : '',
    hidden ? 'is-hidden' : '',
  ].filter(Boolean).join(' ')
  return (
    <section id="timeline" className={cls} aria-label={t('timeline.heading')}>
      <div className="timeline__header">
        <div>
          <h2 className="timeline__title">{t('timeline.heading')}</h2>
          <p className="timeline__sub">{t('timeline.subheading')}</p>
        </div>
        <button className="timeline__toggle" onClick={onToggle} aria-expanded={expanded}>
          {expanded ? '−' : '+'}
        </button>
      </div>

      <ol className="timeline__track">
        <span className="timeline__line" aria-hidden="true" />
        {TIMELINE.map((step, i) => (
          <li
            key={step.id}
            className={step.current ? 'tl-node is-current' : 'tl-node'}
            style={{ '--i': i }}
          >
            <span className="tl-node__dot">
              <span className="tl-node__ring" />
            </span>
            <span className="tl-node__year">{step.year}</span>
            <span className="tl-node__role">{t(`timeline.${step.id}.title`)}</span>
            <span className="tl-node__desc">{t(`timeline.${step.id}.desc`)}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
