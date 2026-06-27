import { lazy, Suspense, useCallback, useEffect, useState, type CSSProperties, type HTMLAttributes } from 'react'
import Bio from './components/Bio'
import useIsMobile from './components/pinboard/hooks/useIsMobile'
import usePrefersReducedMotion from './components/pinboard/hooks/usePrefersReducedMotion'

const loadPinboard = () => import('./components/Pinboard')
const loadPinboardMobile = () => import('./components/PinboardMobile')

const Pinboard = lazy(loadPinboard)
const PinboardMobile = lazy(loadPinboardMobile)

type InertableDivProps = HTMLAttributes<HTMLDivElement>
type IdleWindow = Window & typeof globalThis & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
  cancelIdleCallback?: (handle: number) => void
}

const PINBOARD_EXIT_MS = 880

function App() {
  const [activeView, setActiveView] = useState<'bio' | 'pinboard'>('bio')
  const isBioActive = activeView === 'bio'
  const isPinboardActive = activeView === 'pinboard'
  const isMobile = useIsMobile()
  const reduceMotion = usePrefersReducedMotion()
  const [isPinboardLeaving, setIsPinboardLeaving] = useState(false)

  const openPinboard = useCallback(() => {
    setIsPinboardLeaving(false)
    setActiveView('pinboard')
  }, [])

  const closePinboard = useCallback(() => {
    setIsPinboardLeaving(true)
    setActiveView('bio')
  }, [])

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

  // Keep the pinboard mounted through its fade-out so the exit stays smooth,
  // then unmount it once the leave transition has finished.
  useEffect(() => {
    if (isPinboardActive || !isPinboardLeaving) return

    const timeoutId = globalThis.setTimeout(
      () => setIsPinboardLeaving(false),
      reduceMotion ? 0 : PINBOARD_EXIT_MS,
    )
    return () => globalThis.clearTimeout(timeoutId)
  }, [isPinboardActive, isPinboardLeaving, reduceMotion])

  const isPinboardRendered = isPinboardActive || isPinboardLeaving

  const bioPanelProps: InertableDivProps = !isBioActive ? { inert: true } : {}
  const pinboardPanelProps: InertableDivProps = !isPinboardActive ? { inert: true } : {}

  const panelTransition = reduceMotion
    ? 'opacity 200ms ease'
    : 'opacity 720ms cubic-bezier(0.4, 0, 0.2, 1), transform 760ms cubic-bezier(0.22, 1, 0.36, 1)'

  const buildPanelStyle = (active: boolean, leaveTransform: string): CSSProperties => ({
    transition: panelTransition,
    opacity: active ? 1 : 0,
    transform: reduceMotion ? undefined : active ? 'translateY(0)' : leaveTransform,
    pointerEvents: active ? 'auto' : 'none',
    zIndex: active ? 20 : 0,
    willChange: 'opacity, transform',
  })

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div
        {...bioPanelProps}
        className="absolute inset-0"
        style={buildPanelStyle(isBioActive, 'translateY(-1.5rem)')}
        aria-hidden={!isBioActive}
      >
        <Bio onOpenPinboard={openPinboard} onPreloadPinboard={preloadPinboard} />
      </div>
      <div
        {...pinboardPanelProps}
        className="absolute inset-0"
        style={buildPanelStyle(isPinboardActive, 'translateY(1.5rem)')}
        aria-hidden={!isPinboardActive}
      >
        {isPinboardRendered && (
          <Suspense fallback={<div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.16em] text-[var(--text-secondary)]">Loading pinboard</div>}>
            {isMobile ? (
              <PinboardMobile onClose={closePinboard} />
            ) : (
              <Pinboard onClose={closePinboard} active={isPinboardActive} />
            )}
          </Suspense>
        )}
      </div>
    </div>
  )
}

export default App
