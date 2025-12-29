import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { id: 'bio', label: 'HOME' },
  { id: 'resume', label: 'MY CAREER' },
  { id: 'portfolio', label: 'PORTFOLIO' },
];

export default function NavBar() {
  const [activeSection, setActiveSection] = useState('bio');

  // Track scroll position for active section
  useEffect(() => {
    function handleScroll() {
      // Determine active section based on scroll position
      const sections = NAV_ITEMS.map(item => {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          return { id: item.id, top: rect.top };
        }
        return { id: item.id, top: Infinity };
      });

      // Find the section that is currently in view (closest to top but still visible)
      const offset = 150; // offset for navbar height
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].top <= offset) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 py-3 shadow-lg"
      style={{
        backgroundColor: 'var(--bg-primary)',
        backdropFilter: 'blur(10px)',
        fontFamily: '"Inclusive Sans", sans-serif',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex justify-center gap-2 sm:gap-4 md:gap-8 lg:gap-12">
        {NAV_ITEMS.map((item) => {
          return (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className="nav-btn group relative font-bold transition-all duration-300 hover:opacity-100 cursor-pointer px-2 sm:px-3 md:px-4 py-1 text-[0.55rem] sm:text-xs md:text-sm lg:text-base"
            style={{ 
              color: 'var(--text-primary)', 
              letterSpacing: '0.02em',
              width: 'clamp(60px, 22vw, 130px)',
              textAlign: 'center',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.3',
            }}
          >
            {item.label}
            
            {/* Bottom border - expands from center on hover */}
            <span
              className={`absolute left-1/2 bottom-0 h-0.5 w-full transition-transform duration-300 ease-out -translate-x-1/2 ${
                activeSection === item.id
                  ? 'scale-x-100'
                  : 'scale-x-0 group-hover:scale-x-100'
              }`}
              style={{ backgroundColor: 'var(--text-primary)', willChange: 'transform', backfaceVisibility: 'hidden' }}
            />
            
            {/* Left border - expands from bottom on active */}
            <span
              className={`absolute left-0 bottom-0 w-0.5 h-full transition-transform duration-300 ease-out origin-bottom ${
                activeSection === item.id
                  ? 'scale-y-100'
                  : 'scale-y-0'
              }`}
              style={{ backgroundColor: 'var(--text-primary)', transitionDelay: activeSection === item.id ? '150ms' : '0ms', willChange: 'transform', backfaceVisibility: 'hidden' }}
            />
            
            {/* Right border - expands from bottom on active */}
            <span
              className={`absolute right-0 bottom-0 w-0.5 h-full transition-transform duration-300 ease-out origin-bottom ${
                activeSection === item.id
                  ? 'scale-y-100'
                  : 'scale-y-0'
              }`}
              style={{ backgroundColor: 'var(--text-primary)', transitionDelay: activeSection === item.id ? '150ms' : '0ms', willChange: 'transform', backfaceVisibility: 'hidden' }}
            />
            
            {/* Top border - expands from both corners on active */}
            <span
              className={`absolute left-0 top-0 h-0.5 w-1/2 transition-transform duration-300 ease-out origin-left ${
                activeSection === item.id
                  ? 'scale-x-100'
                  : 'scale-x-0'
              }`}
              style={{ backgroundColor: 'var(--text-primary)', transitionDelay: activeSection === item.id ? '300ms' : '0ms', willChange: 'transform', backfaceVisibility: 'hidden' }}
            />
            <span
              className={`absolute right-0 top-0 h-0.5 w-1/2 transition-transform duration-300 ease-out origin-right ${
                activeSection === item.id
                  ? 'scale-x-100'
                  : 'scale-x-0'
              }`}
              style={{ backgroundColor: 'var(--text-primary)', transitionDelay: activeSection === item.id ? '300ms' : '0ms', willChange: 'transform', backfaceVisibility: 'hidden' }}
            />
          </button>
          );
        })}
      </div>
    </nav>
  );
}
