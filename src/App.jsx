import { Suspense, useCallback, useState } from 'react'
import Scene from './three/Scene.jsx'
import TopBar from './components/TopBar.jsx'
import Hero from './components/Hero.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import Timeline from './components/Timeline.jsx'
import ContactModal from './components/ContactModal.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import SeoSync from './components/SeoSync.jsx'

export default function App() {
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
