import { useState } from 'react'
import Bio from './components/Bio'
import Pinboard from './components/Pinboard'
import PinboardMobile from './components/PinboardMobile'
import useIsMobile from './components/pinboard/hooks/useIsMobile'

function App() {
  const [activeView, setActiveView] = useState<'bio' | 'pinboard'>('bio')
  const isBioActive = activeView === 'bio'
  const isPinboardActive = activeView === 'pinboard'
  const isMobile = useIsMobile()

  return (
    <div className="relative w-full h-full overflow-hidden" style={{backgroundColor: 'var(--bg-primary)'}}>
      <div
        className={`absolute inset-0 transition-all duration-700 ease-out ${
          isBioActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 scale-[0.98]'
        }`}
        style={{ pointerEvents: isBioActive ? 'auto' : 'none', zIndex: isBioActive ? 20 : 0 }}
        aria-hidden={!isBioActive}
      >
        <Bio onOpenPinboard={() => setActiveView('pinboard')} />
      </div>
      <div
        className={`absolute inset-0 transition-all duration-700 ease-out ${
          isPinboardActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 scale-[1.02]'
        }`}
        style={{ pointerEvents: isPinboardActive ? 'auto' : 'none', zIndex: isPinboardActive ? 20 : 0 }}
        aria-hidden={!isPinboardActive}
      >
        {isMobile ? (
          <PinboardMobile onClose={() => setActiveView('bio')} />
        ) : (
          <Pinboard onClose={() => setActiveView('bio')} />
        )}
      </div>
    </div>
  )
}

export default App
