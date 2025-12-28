import { useEffect, useRef, useState } from 'react';
import TypedTitle from './TypedTitle';

// BlockReveal animation component (matching ResumeSection style)
function BlockReveal({
  children,
  isVisible,
  delay = 0,
  blockColor = 'block-white',
  className = '',
}: {
  children: React.ReactNode;
  isVisible: boolean;
  delay?: number;
  blockColor?: 'block-white' | 'block-cyan' | 'block-magenta' | 'block-amber';
  className?: string;
}) {
  return (
    <span
      className={`block-reveal ${blockColor} delay-${delay} ${isVisible ? 'animate' : ''} ${className}`}
    >
      <span className="block-reveal-text">{children}</span>
    </span>
  );
}

interface TimelineItem {
  year: number;
  endYear?: number | 'Present';
  title: string;
  organization: string;
  description: string;
  color: string;
  type: 'work' | 'education';
}

const timelineData: TimelineItem[] = [
  {
    year: 2015,
    endYear: 2019,
    title: 'B.S. in Computer Science',
    organization: 'UC SAN DIEGO',
    description:
      'Focused on game development, engine architecture, and web systems. Built interactive projects, explored low-level rendering and gameplay systems, and mentored students as a Computer Science Tutor.',
    color: '#0066B8',
    type: 'education',
  },
  {
    year: 2019,
    endYear: 2020,
    title: 'Master in Computer Science',
    organization: 'UC BERKELEY',
    description:
      'Conducted applied research at Vive Center for Enhanced Reality, working on immersive, real-time systems at the intersection of graphics, interaction, and XR.',
    color: '#FDB515',
    type: 'education',
  },
  {
    year: 2020,
    endYear: 2021,
    title: 'AZURE INFRA DEV',
    organization: 'MICROSOFT',
    description:
      'Architected and operated mission-critical Azure commerce billing pipelines. Designed secure, high-throughput ETL systems with Azure Data Factory and Azure Functions to ensure accuracy, reliability, and scale.',
    color: '#0089D6',
    type: 'work',
  },
  {
    year: 2021,
    endYear: 'Present',
    title: 'FULL STACK DEV',
    organization: 'XBOX',
    description:
      'Driving end-to-end development of Xbox consumer store experiences across platforms. Building scalable, high-performance systems that serve millions of players with reliability, speed, and polish.',
    color: '#107C10',
    type: 'work',
  },
];

// Timeline constants
const startYear = 2015;
const currentYear = new Date().getFullYear();

// Key milestone years for snap points (from timelineData)
const keyYears = timelineData.map(item => item.year);

// Era color palettes with extended properties for parallax system
const eraColors: { [key: number]: { 
  bg: string; 
  glow: string;
  // Parallax system properties
  cityBrightness: number;  // 0-1, how lit the city appears
  motionSpeed: number;     // multiplier for parallax speed
  atmosphereDensity: number; // fog/haze intensity
} } = {
  2015: { bg: 'rgba(0, 102, 184, 0.15)', glow: '#0066B8', cityBrightness: 0.4, motionSpeed: 0.7, atmosphereDensity: 0.6 },
  2016: { bg: 'rgba(0, 102, 184, 0.15)', glow: '#0066B8', cityBrightness: 0.45, motionSpeed: 0.75, atmosphereDensity: 0.55 },
  2017: { bg: 'rgba(0, 102, 184, 0.15)', glow: '#0066B8', cityBrightness: 0.5, motionSpeed: 0.8, atmosphereDensity: 0.5 },
  2018: { bg: 'rgba(0, 102, 184, 0.15)', glow: '#0066B8', cityBrightness: 0.55, motionSpeed: 0.85, atmosphereDensity: 0.45 },
  2019: { bg: 'rgba(253, 181, 21, 0.15)', glow: '#FDB515', cityBrightness: 0.6, motionSpeed: 0.9, atmosphereDensity: 0.4 },
  2020: { bg: 'rgba(0, 137, 214, 0.15)', glow: '#0089D6', cityBrightness: 0.5, motionSpeed: 0.6, atmosphereDensity: 0.7 },
  2021: { bg: 'rgba(16, 124, 16, 0.15)', glow: '#107C10', cityBrightness: 0.8, motionSpeed: 1.0, atmosphereDensity: 0.3 },
  2022: { bg: 'rgba(16, 124, 16, 0.15)', glow: '#107C10', cityBrightness: 0.85, motionSpeed: 1.0, atmosphereDensity: 0.25 },
  2023: { bg: 'rgba(16, 124, 16, 0.15)', glow: '#107C10', cityBrightness: 0.9, motionSpeed: 1.0, atmosphereDensity: 0.2 },
  2024: { bg: 'rgba(16, 124, 16, 0.15)', glow: '#107C10', cityBrightness: 0.95, motionSpeed: 1.0, atmosphereDensity: 0.15 },
  2025: { bg: 'rgba(16, 124, 16, 0.15)', glow: '#107C10', cityBrightness: 1.0, motionSpeed: 1.0, atmosphereDensity: 0.1 },
};

// SVG skyline paths with varying detail density
const skylinePaths = {
  // Far layer: minimal detail, wide slabs, few features
  far: "M0,200 L0,140 L80,140 L80,100 L160,100 L160,140 L280,140 L280,80 L360,80 L360,140 L480,140 L480,120 L600,120 L600,140 L720,140 L720,60 L800,60 L800,140 L920,140 L920,100 L1040,100 L1040,140 L1200,140 L1200,200 Z",
  // Mid layer: medium detail, mixed heights
  mid: "M0,200 L0,130 L50,130 L50,90 L90,90 L90,130 L140,130 L140,60 L180,60 L180,110 L240,110 L240,70 L290,70 L290,130 L350,130 L350,40 L390,40 L390,100 L450,100 L450,130 L520,130 L520,80 L570,80 L570,50 L620,50 L620,130 L700,130 L700,70 L750,70 L750,130 L820,130 L820,30 L860,30 L860,90 L920,90 L920,130 L990,130 L990,55 L1040,55 L1040,110 L1100,110 L1100,130 L1160,130 L1160,75 L1200,75 L1200,200 Z",
  // Near layer: high detail, needle towers, strong vertical breaks, negative space
  near: "M0,200 L0,160 L30,160 L30,120 L50,120 L50,160 L90,160 L90,80 L110,80 L110,140 L130,140 L130,160 L180,160 L180,50 L200,50 L200,100 L220,100 L220,160 L280,160 L280,140 L300,140 L300,70 L320,70 L320,110 L340,110 L340,160 L400,160 L400,30 L420,30 L420,90 L440,90 L440,160 L520,160 L520,100 L540,100 L540,60 L560,60 L560,120 L580,120 L580,160 L660,160 L660,80 L680,80 L680,45 L700,45 L700,110 L720,110 L720,160 L800,160 L800,140 L820,140 L820,20 L840,20 L840,70 L860,70 L860,130 L880,130 L880,160 L960,160 L960,90 L980,90 L980,55 L1000,55 L1000,120 L1020,120 L1020,160 L1100,160 L1100,70 L1120,70 L1120,40 L1140,40 L1140,100 L1160,100 L1160,160 L1200,160 L1200,200 Z"
};

export default function CareerTimeline() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeYear, setActiveYear] = useState(startYear);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Track when section comes into view for initial animation
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setAnimationKey((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  // Derive active timeline item from activeYear (no useEffect needed)
  // Prioritize items that START on the activeYear, then fall back to items where year falls in range
  const activeItem = timelineData.find((item) => item.year === activeYear) ||
    timelineData.find((item) => {
      const endYear = item.endYear === 'Present' ? currentYear : item.endYear;
      return activeYear > item.year && activeYear <= (endYear || item.year);
    }) || null;

  // Track current key index and last update time to prevent rapid jumping
  const currentKeyIndexRef = useRef(0);
  const isScrollingProgrammaticallyRef = useRef(false);

  // Handle vertical scroll to control horizontal timeline - snaps to key milestones
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      // Skip if we're programmatically scrolling to prevent loops
      if (isScrollingProgrammaticallyRef.current) return;
      
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight - window.innerHeight;
      
      // Calculate how far we've scrolled through this section
      const scrolledIntoSection = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolledIntoSection / sectionHeight));
      
      setScrollProgress(progress);
      
      // Snap to key milestone years based on progress thresholds
      // Add buffer at end: 2021 is reached at 85% progress, leaving 15% buffer for "Present" zone
      const bufferEnd = 0.85;
      const adjustedProgress = Math.min(progress / bufferEnd, 1);
      
      // Calculate target index based on scroll progress
      const numMilestones = keyYears.length;
      const rawTargetIndex = Math.round(adjustedProgress * (numMilestones - 1));
      const targetKeyIndex = Math.min(rawTargetIndex, numMilestones - 1);
      
      const currentIndex = currentKeyIndexRef.current;
      const movement = Math.abs(targetKeyIndex - currentIndex);
      
      // If trying to jump more than 1 milestone, clamp to ±1 and scroll to that position
      if (movement > 1) {
        const nextIndex = targetKeyIndex > currentIndex 
          ? currentIndex + 1 
          : currentIndex - 1;
        
        // Update state
        currentKeyIndexRef.current = nextIndex;
        const snappedYear = keyYears[nextIndex];
        setActiveYear(snappedYear);
        
        // Programmatically scroll to the next milestone's position to prevent over-scrolling
        isScrollingProgrammaticallyRef.current = true;
        
        const sectionRect = section.getBoundingClientRect();
        const sectionTop = window.scrollY + sectionRect.top;
        const targetProgress = (nextIndex / (numMilestones - 1)) * bufferEnd;
        const targetScroll = sectionTop + (targetProgress * sectionHeight);
        
        window.scrollTo({
          top: targetScroll,
          behavior: 'instant' // Use instant to prevent animation lag
        });
        
        // Reset flag after a short delay
        setTimeout(() => {
          isScrollingProgrammaticallyRef.current = false;
        }, 50);
      } else if (targetKeyIndex !== currentIndex) {
        // Normal one-step movement
        currentKeyIndexRef.current = targetKeyIndex;
        const snappedYear = keyYears[targetKeyIndex];
        setActiveYear(snappedYear);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const eraStyle = eraColors[activeYear] || eraColors[currentYear];

  return (
    <div 
      ref={sectionRef}
      className="relative w-full" 
      style={{ 
        fontFamily: '"Inclusive Sans", sans-serif',
        // Make section tall enough to scroll through - reduced for mobile
        height: `${(keyYears.length) * 50 + 30}vh`,
        minHeight: '300vh',
      }}
    >
      {/* Sticky container that stays in view while scrolling */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Animated background gradient based on era */}
        <div
          className="absolute inset-0 transition-all duration-700 ease-out"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, ${eraStyle.bg} 0%, transparent 70%)`,
          }}
        />

        {/* Layer 0: Atmospheric haze (static, creates depth separation) */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
          style={{
            background: `linear-gradient(
              to top,
              rgba(0, 0, 0, ${0.3 * eraStyle.atmosphereDensity}) 0%,
              rgba(0, 0, 0, ${0.15 * eraStyle.atmosphereDensity}) 30%,
              transparent 60%
            )`,
            opacity: eraStyle.atmosphereDensity,
          }}
        />

        {/* Layer 1: Far skyline (very slow, lowest contrast, blurred/hazy) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48 sm:h-64 md:h-80 pointer-events-none transition-all duration-1000"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200'%3E%3Cpath fill='%23${eraStyle.glow.slice(1)}' d='${skylinePaths.far}'/%3E%3C/svg%3E")`,
            backgroundSize: '120% auto',
            backgroundPosition: 'bottom center',
            backgroundRepeat: 'repeat-x',
            // Slowest movement + subtle vertical float
            transform: `translateX(${(scrollProgress - 0.5) * -40 * eraStyle.motionSpeed}px) translateY(${Math.sin(scrollProgress * Math.PI) * 3}px)`,
            transition: 'transform 0.8s ease-out, opacity 0.8s ease-out',
            opacity: 0.06 * eraStyle.cityBrightness,
            filter: 'blur(2px)',
          }}
        />

        {/* Fog band between far and mid layers */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 md:h-48 pointer-events-none"
          style={{
            background: `linear-gradient(
              to top,
              transparent 0%,
              rgba(${eraStyle.glow === '#FDB515' ? '253, 181, 21' : eraStyle.glow === '#0089D6' ? '0, 137, 214' : eraStyle.glow === '#107C10' ? '16, 124, 16' : '0, 102, 184'}, ${0.05 * eraStyle.atmosphereDensity}) 40%,
              transparent 100%
            )`,
            opacity: 0.5,
            transition: 'opacity 0.8s ease-out',
          }}
        />

        {/* Layer 2: Mid skyline (medium speed, medium contrast) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 sm:h-56 md:h-72 pointer-events-none transition-all duration-700"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200'%3E%3Cpath fill='%23${eraStyle.glow.slice(1)}' d='${skylinePaths.mid}'/%3E%3C/svg%3E")`,
            backgroundSize: '110% auto',
            backgroundPosition: 'bottom center',
            backgroundRepeat: 'repeat-x',
            // Medium movement + slight parallax sway
            transform: `translateX(${(scrollProgress - 0.5) * -100 * eraStyle.motionSpeed}px) translateY(${Math.sin(scrollProgress * Math.PI * 1.5) * 5}px) scale(${0.98 + scrollProgress * 0.02})`,
            transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
            opacity: 0.12 * eraStyle.cityBrightness,
            filter: 'blur(0.5px)',
          }}
        />

        {/* Layer 3: Near skyline (fast, high contrast, sharp) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 sm:h-48 md:h-64 pointer-events-none transition-all duration-500"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 200'%3E%3Cpath fill='%23${eraStyle.glow.slice(1)}' d='${skylinePaths.near}'/%3E%3C/svg%3E")`,
            backgroundSize: '100% auto',
            backgroundPosition: 'bottom center',
            backgroundRepeat: 'repeat-x',
            // Fastest movement, stable (no vertical drift)
            transform: `translateX(${(scrollProgress - 0.5) * -180 * eraStyle.motionSpeed}px)`,
            transition: 'transform 0.4s ease-out, opacity 0.4s ease-out',
            opacity: 0.25 * eraStyle.cityBrightness,
            // Subtle glow on near layer only
            filter: `drop-shadow(0 0 ${8 * eraStyle.cityBrightness}px ${eraStyle.glow}40)`,
          }}
        />

        {/* Foreground anchor strip (static, grounds the scene) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-4 sm:h-6 md:h-8 pointer-events-none"
          style={{
            background: `linear-gradient(
              to top,
              rgba(0, 0, 0, 0.4) 0%,
              rgba(0, 0, 0, 0.2) 50%,
              transparent 100%
            )`,
          }}
        />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 pt-16 sm:pt-20 md:pt-24 pb-4 sm:pb-6 md:pb-8 text-center px-4">
            <TypedTitle text="CAREER" className="mb-2 sm:mb-4" />
            <p className="text-sm sm:text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
              Scroll to explore my journey
            </p>
          </div>

          {/* Timeline container */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Active role content */}
            <div className="flex-shrink-0 min-h-[180px] sm:min-h-[200px] flex items-center justify-center px-4 sm:px-6 md:px-8 mb-4 sm:mb-6 md:mb-8">
              {activeItem && (
                <div
                  key={`${activeItem.year}-${animationKey}`}
                  className="text-center w-full max-w-2xl cyber-card rounded-lg p-4 sm:p-6 md:p-8 relative"
                  style={{
                    animation: 'fadeSlideIn 0.5s ease-out',
                  }}
                >
                  {/* Cyber corners */}
                  <div className="cyber-corner cyber-corner-tl" />
                  <div className="cyber-corner cyber-corner-tr" />
                  <div className="cyber-corner cyber-corner-bl" />
                  <div className="cyber-corner cyber-corner-br" />

                  <div className="relative z-10">
                    {/* Type badge */}
                    {/* <div className="mb-4">
                      <BlockReveal
                        key={`badge-${activeItem.year}-${animationKey}`}
                        isVisible={isVisible}
                        delay={0}
                        blockColor={activeItem.type === 'work' ? 'block-cyan' : 'block-amber'}
                      >
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${activeItem.color}33`,
                            color: activeItem.color,
                            border: `1px solid ${activeItem.color}`,
                          }}
                        >
                          {activeItem.type === 'work' ? 'Experience' : 'Education'}
                        </span>
                      </BlockReveal>
                    </div> */}

                    {/* Title */}
                    <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 cyber-title">
                      <BlockReveal
                        key={`title-${activeItem.year}-${animationKey}`}
                        isVisible={isVisible}
                        delay={1}
                        blockColor="block-amber"
                      >
                        <span
                          className="cyber-glitch-text"
                          data-text={activeItem.title}
                          style={{
                            color: 'var(--text-primary)',
                            textShadow: `0 0 30px ${activeItem.color}, 0 0 60px ${activeItem.color}50`,
                          }}
                        >
                          {activeItem.title}
                        </span>
                      </BlockReveal>
                    </h3>

                    {/* Organization */}
                    <p className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-4">
                      <BlockReveal
                        key={`org-${activeItem.year}-${animationKey}`}
                        isVisible={isVisible}
                        delay={2}
                        blockColor="block-cyan"
                      >
                        <span
                          style={{
                            color: activeItem.color,
                            textShadow: `0 0 10px ${activeItem.color}`,
                          }}
                        >
                          {activeItem.organization}
                        </span>
                      </BlockReveal>
                    </p>

                    {/* Period */}
                    <p className="text-sm sm:text-base md:text-lg mb-2 sm:mb-3">
                      <BlockReveal
                        key={`period-${activeItem.year}-${animationKey}`}
                        isVisible={isVisible}
                        delay={3}
                        blockColor="block-magenta"
                      >
                        <span style={{ color: 'var(--accent-magenta)', textShadow: '0 0 5px var(--accent-magenta)' }}>
                          {activeItem.year} — {activeItem.endYear === 'Present' ? 'Present' : activeItem.endYear}
                        </span>
                      </BlockReveal>
                    </p>

                    {/* Description */}
                    <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                      <BlockReveal
                        key={`desc-${activeItem.year}-${animationKey}`}
                        isVisible={isVisible}
                        delay={4}
                        blockColor="block-white"
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {activeItem.description}
                        </span>
                      </BlockReveal>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Horizontal timeline - carousel style with active dot centered */}
            <div className="flex-shrink-0 relative h-24 sm:h-32 md:h-40 mx-4 sm:mx-6 md:mx-8 overflow-hidden">
              {/* Timeline track container - moves with active milestone */}
              {(() => {
                const activeIndex = keyYears.indexOf(activeYear);
                const totalDots = 5; // 4 years + Present
                // Responsive dot spacing - tighter on mobile
                const dotSpacing = typeof window !== 'undefined' && window.innerWidth < 640 ? 35 : 40;
                // Calculate offset to center the active dot (activeIndex position should be at 50%)
                const centerOffset = 50 - (activeIndex * dotSpacing);
                
                return (
                  <div 
                    className="absolute inset-0 transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(${centerOffset - 50}%)`,
                    }}
                  >
                    {/* Timeline track */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 h-1"
                      style={{
                        left: '50%',
                        width: `${dotSpacing * (totalDots - 1)}%`,
                        transform: 'translateY(-50%)',
                      }}
                    >
                      {/* Background track */}
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: 'var(--border-subtle)' }}
                      />
                      {/* Progress fill - solid up to active milestone */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${(activeIndex / (totalDots - 1)) * 100}%`,
                          backgroundColor: activeItem?.color || 'var(--text-primary)',
                          boxShadow: `0 0 10px ${activeItem?.color || 'var(--text-primary)'}`,
                        }}
                      />
                      {/* Dotted line from 2021 to Present */}
                      <div 
                        className="absolute top-0 bottom-0 rounded-full"
                        style={{ 
                          left: `${(3 / (totalDots - 1)) * 100}%`,
                          width: `${(1 / (totalDots - 1)) * 100}%`,
                          background: `repeating-linear-gradient(
                            to right,
                            ${timelineData[timelineData.length - 1].color} 0px,
                            ${timelineData[timelineData.length - 1].color} 6px,
                            transparent 6px,
                            transparent 12px
                          )`,
                          opacity: activeYear === 2021 ? 1 : 0.4,
                          transition: 'opacity 0.5s ease-out',
                        }}
                      />
                    </div>

                    {/* Key milestone anchor dots */}
                    {keyYears.map((year, index) => {
                      const isActive = year === activeYear;
                      const isPast = index < activeIndex;
                      const item = timelineData.find(t => t.year === year);
                      // Position each dot evenly
                      const position = 50 + (index * dotSpacing);
                      
                      // Click handler to scroll to this milestone
                      const handleDotClick = () => {
                        const section = sectionRef.current;
                        if (!section) return;
                        
                        const sectionRect = section.getBoundingClientRect();
                        const sectionTop = window.scrollY + sectionRect.top;
                        const sectionHeight = section.offsetHeight - window.innerHeight;
                        
                        // Calculate target scroll position based on index
                        const targetProgress = index / (keyYears.length - 1);
                        const targetScroll = sectionTop + (targetProgress * sectionHeight);
                        
                        window.scrollTo({
                          top: targetScroll,
                          behavior: 'smooth'
                        });
                      };
                      
                      return (
                        <div
                          key={year}
                          className="absolute top-1/2 flex flex-col items-center transition-all duration-500 ease-out cursor-pointer"
                          style={{ 
                            left: `${position}%`,
                            transform: 'translateX(-50%) translateY(-50%)',
                            zIndex: isActive ? 10 : 1,
                          }}
                          onClick={handleDotClick}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleDotClick();
                            }
                          }}
                        >
                          {/* Dot */}
                          <div
                            className="rounded-full transition-all duration-500 ease-out hover:scale-125"
                            style={{
                              width: isActive ? 'clamp(20px, 5vw, 28px)' : 'clamp(10px, 2.5vw, 14px)',
                              height: isActive ? 'clamp(20px, 5vw, 28px)' : 'clamp(10px, 2.5vw, 14px)',
                              backgroundColor: item?.color || 'var(--text-primary)',
                              boxShadow: isActive 
                                ? `0 0 15px ${item?.color}, 0 0 30px ${item?.color}` 
                                : 'none',
                              opacity: isActive ? 1 : isPast ? 0.6 : 0.35,
                              filter: isActive ? 'none' : 'grayscale(30%)',
                            }}
                          />
                          {/* Year label */}
                          <span
                            className="mt-2 sm:mt-3 md:mt-4 font-bold transition-all duration-500 ease-out whitespace-nowrap hover:opacity-100"
                            style={{
                              fontSize: isActive ? 'clamp(0.875rem, 2vw, 1.25rem)' : 'clamp(0.625rem, 1.5vw, 0.75rem)',
                              color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                              textShadow: isActive ? `0 0 10px ${item?.color}` : 'none',
                              opacity: isActive ? 1 : 0.6,
                            }}
                          >
                            {year}
                          </span>
                        </div>
                      );
                    })}
                    
                    {/* Present dot - 5th position, not snappable */}
                    {(() => {
                      const presentIndex = 4;
                      const position = 50 + (presentIndex * dotSpacing);
                      const xboxColor = timelineData[timelineData.length - 1].color;
                      
                      return (
                        <div 
                          className="absolute top-1/2 flex flex-col items-center transition-all duration-500 ease-out"
                          style={{ 
                            left: `${position}%`,
                            transform: 'translateX(-50%) translateY(-50%)',
                          }}
                        >
                          <div
                            className="rounded-full border-2 transition-all duration-500 ease-out"
                            style={{
                              width: activeYear === 2021 ? 'clamp(14px, 3.5vw, 18px)' : 'clamp(10px, 2.5vw, 14px)',
                              height: activeYear === 2021 ? 'clamp(14px, 3.5vw, 18px)' : 'clamp(10px, 2.5vw, 14px)',
                              borderColor: xboxColor,
                              backgroundColor: 'transparent',
                              borderStyle: 'dashed',
                              opacity: activeYear === 2021 ? 0.9 : 0.35,
                              boxShadow: activeYear === 2021 
                                ? `0 0 10px ${xboxColor}` 
                                : 'none',
                            }}
                          />
                          <span
                            className="mt-2 sm:mt-3 md:mt-4 font-bold transition-all duration-500 ease-out whitespace-nowrap"
                            style={{
                              fontSize: activeYear === 2021 ? 'clamp(0.75rem, 1.8vw, 1rem)' : 'clamp(0.625rem, 1.5vw, 0.75rem)',
                              color: activeYear === 2021 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                              textShadow: activeYear === 2021 ? `0 0 10px ${xboxColor}` : 'none',
                              opacity: activeYear === 2021 ? 0.9 : 0.5,
                            }}
                          >
                            Present
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}
            </div>

          {/* Progress bar */}
          <div className="flex-shrink-0 px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
            <div
              className="h-1 rounded-full overflow-hidden mx-auto max-w-2xl"
              style={{ backgroundColor: 'var(--border-subtle)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${scrollProgress * 100}%`,
                  backgroundColor: eraStyle.glow,
                  boxShadow: `0 0 10px ${eraStyle.glow}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
