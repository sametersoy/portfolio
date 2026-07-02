import { useProgress } from '@react-three/drei'
import { useTranslation } from 'react-i18next'

export default function LoadingScreen() {
  const { active, progress } = useProgress()
  const { t } = useTranslation()
  const pct = Math.round(progress)

  return (
    <div className={active ? 'loader' : 'loader is-done'} aria-hidden={!active}>
      <div className="loader__inner">
        <div className="loader__rack">
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="loader__label">{t('loading')}</p>
        <p className="loader__pct">{pct}%</p>
      </div>
    </div>
  )
}
