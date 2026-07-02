import { Suspense, useCallback, useState } from 'react'
import Scene from './three/Scene.jsx'
import TopBar from './components/TopBar.jsx'
import Hero from './components/Hero.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import Timeline from './components/Timeline.jsx'
import ContactModal from './components/ContactModal.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import SeoSync from './components/SeoSync.jsx'
import { useTranslation } from 'react-i18next'

export default function App() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(null) // unit object or null
  const [tlExpanded, setTlExpanded] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  const handleSelect = useCallback((unit) => {
    setSelected(unit)
    if (unit) setTlExpanded(false)
  }, [])

  return (
    <>
      <SeoSync />
      <LoadingScreen />

      <main className="stage">
        <Suspense fallback={null}>
          <Scene selectedId={selected?.id ?? null} onSelect={handleSelect} />
        </Suspense>
      </main>

      <div className="ui">
        <TopBar
          onReset={() => setSelected(null)}
          onCareer={() => setTlExpanded((v) => !v)}
          onContact={() => setContactOpen(true)}
        />

        <Hero hidden={!!selected} />

        <div className="rack-badge" aria-hidden="true">
          <span className="rack-badge__led" />
          {t('rack.label')} · <strong>{t('rack.online')}</strong>
        </div>

        <DetailPanel unit={selected} onClose={() => setSelected(null)} />

        <Timeline
          expanded={tlExpanded}
          hidden={!!selected}
          onToggle={() => setTlExpanded((v) => !v)}
        />
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  )
}
