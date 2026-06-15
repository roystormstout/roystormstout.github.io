import { lazy, Suspense, useCallback, useEffect, useState, type HTMLAttributes } from 'react'
import Bio from './components/Bio'
import useIsMobile from './components/pinboard/hooks/useIsMobile'

const loadPinboard = () => import('./components/Pinboard')
const loadPinboardMobile = () => import('./components/PinboardMobile')

const Pinboard = lazy(loadPinboard)
const PinboardMobile = lazy(loadPinboardMobile)

type InertableDivProps = HTMLAttributes<HTMLDivElement>
type IdleWindow = Window & typeof globalThis & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
  cancelIdleCallback?: (handle: number) => void
}

function App() {
  const [activeView, setActiveView] = useState<'bio' | 'pinboard'>('bio')
  const isBioActive = activeView === 'bio'
  const isPinboardActive = activeView === 'pinboard'
  const isMobile = useIsMobile()

  const preloadPinboard = useCallback(() => {
    if (isMobile) {
      void loadPinboardMobile()
      return
    }

    void loadPinboard()
  }, [isMobile])

  useEffect(() => {
    if (isPinboardActive) return

    const idleWindow = window as IdleWindow

    if (idleWindow.requestIdleCallback && idleWindow.cancelIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(preloadPinboard, { timeout: 1200 })
      return () => idleWindow.cancelIdleCallback?.(idleId)
    }

    const timeoutId = globalThis.setTimeout(preloadPinboard, 600)
    return () => globalThis.clearTimeout(timeoutId)
  }, [isPinboardActive, preloadPinboard])

  const bioPanelProps: InertableDivProps = !isBioActive ? { inert: true } : {}
  const pinboardPanelProps: InertableDivProps = !isPinboardActive ? { inert: true } : {}

  return (
    <div className="relative w-full h-full overflow-hidden" style={{backgroundColor: 'var(--bg-primary)'}}>
      <div
        {...bioPanelProps}
        className={`absolute inset-0 transition-all duration-700 ease-out ${
          isBioActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 scale-[0.98]'
        }`}
        style={{ pointerEvents: isBioActive ? 'auto' : 'none', zIndex: isBioActive ? 20 : 0 }}
        aria-hidden={!isBioActive}
      >
        <Bio onOpenPinboard={() => setActiveView('pinboard')} onPreloadPinboard={preloadPinboard} />
      </div>
      <div
        {...pinboardPanelProps}
        className={`absolute inset-0 transition-all duration-700 ease-out ${
          isPinboardActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 scale-[1.02]'
        }`}
        style={{ pointerEvents: isPinboardActive ? 'auto' : 'none', zIndex: isPinboardActive ? 20 : 0 }}
        aria-hidden={!isPinboardActive}
      >
        {isPinboardActive && (
          <Suspense fallback={<div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.16em] text-[var(--text-secondary)]">Loading pinboard</div>}>
            {isMobile ? (
              <PinboardMobile onClose={() => setActiveView('bio')} />
            ) : (
              <Pinboard onClose={() => setActiveView('bio')} />
            )}
          </Suspense>
        )}
      </div>
    </div>
  )
}

export default App
