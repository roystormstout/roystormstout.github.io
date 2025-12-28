import { useState, useRef, useEffect } from 'react';
import BlockReveal from '../BlockReveal';
import MoonImg from '../../assets/moon.png';
import DialogImg from '../../assets/dialog.png';

interface ProjectProps {
  isEven: boolean;
  isVisible: boolean;
}

export default function Project1({ isEven, isVisible }: ProjectProps) {
  const [isDialogHovered, setIsDialogHovered] = useState(false);
  const [artVisible, setArtVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const artRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === artRef.current) {
            setArtVisible(entry.isIntersecting);
          } else if (entry.target === textRef.current) {
            setTextVisible(entry.isIntersecting);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (artRef.current) observer.observe(artRef.current);
    if (textRef.current) observer.observe(textRef.current);

    return () => observer.disconnect();
  }, []);
  
  return (
    <div
      className={`flex flex-col ${
        isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
      } gap-6 sm:gap-8 md:gap-12 items-center transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      {/* Image */}
      <div className="w-full lg:w-1/2 flex-shrink-0">
        <div ref={artRef} className="relative rounded-lg overflow-hidden shadow-2xl group aspect-square">
          {/* Moon - slides in from top */}
          <img
            src={MoonImg}
            alt="Moon background"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-1200 ease-out"
            style={{
              transform: artVisible ? 'translateY(0)' : 'translateY(-100%)',
              opacity: artVisible ? 1 : 0,
              transitionDuration: '1200ms',
            }}
          />
          {/* Dialog - slides in from left after moon, positioned lower */}
          <img
            src={DialogImg}
            alt="Dialog overlay"
            className="absolute w-1/2 h-1/2 object-contain z-10 cursor-pointer"
            onMouseEnter={() => setIsDialogHovered(true)}
            onMouseLeave={() => setIsDialogHovered(false)}
            style={{
              transform: artVisible 
                ? `translateX(0) translateY(${isDialogHovered ? '85%' : '100%'}) scale(${isDialogHovered ? 1.25 : 1})` 
                : 'translateX(-100%) translateY(100%)',
              opacity: artVisible ? 1 : 0,
              transitionDuration: isDialogHovered || !artVisible ? '200ms' : '1200ms',
              transitionTimingFunction: 'ease-out',
              transitionDelay: artVisible && !isDialogHovered ? '600ms' : '0ms',
              left: '25%',
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div ref={textRef} className="w-full lg:w-1/2 space-y-4 sm:space-y-6">
        <h3
          className="text-2xl sm:text-3xl md:text-4xl font-bold"
          style={{ color: 'var(--text-primary)', letterSpacing: '0.02em' }}
        >
          <BlockReveal isVisible={textVisible} delay={0} blockColor="block-amber">
            A Graph‑Based Framework to Bridge Movies and Synopses
          </BlockReveal>
        </h3>

        <p
          className="text-base sm:text-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          <BlockReveal isVisible={textVisible} delay={1} blockColor="block-white">
            ICCV Oral: Aligned 328 films' temporal segments to synopsis paragraphs via a graph‑based pipeline; shipped a cross‑platform React/Flask annotator and motion‑energy preprocessing for segments/keyframes.
          </BlockReveal>
        </p>

        <BlockReveal isVisible={textVisible} delay={2} blockColor="block-cyan">
          <a
            href="https://openaccess.thecvf.com/content_ICCV_2019/papers/Xiong_A_Graph-Based_Framework_to_Bridge_Movies_and_Synopses_ICCV_2019_paper.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-block px-6 py-3 font-semibold transition-all duration-300"
            style={{
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}
          >
            PAPER →
            {/* Bottom border - expands from center on hover */}
            <span
              className="absolute left-1/2 bottom-0 h-0.5 transition-all duration-300 ease-out -translate-x-1/2 w-0 group-hover:w-full"
              style={{ backgroundColor: 'var(--text-primary)' }}
            />
            {/* Left border - expands from bottom on hover */}
            <span
              className="absolute left-0 bottom-0 w-0.5 transition-all duration-300 ease-out origin-bottom h-0 group-hover:h-full"
              style={{ backgroundColor: 'var(--text-primary)', transitionDelay: '150ms' }}
            />
            {/* Right border - expands from bottom on hover */}
            <span
              className="absolute right-0 bottom-0 w-0.5 transition-all duration-300 ease-out origin-bottom h-0 group-hover:h-full"
              style={{ backgroundColor: 'var(--text-primary)', transitionDelay: '150ms' }}
            />
            {/* Top border - expands from both corners on hover */}
            <span
              className="absolute left-0 top-0 h-0.5 transition-all duration-300 ease-out w-0 group-hover:w-1/2"
              style={{ backgroundColor: 'var(--text-primary)', transitionDelay: '300ms' }}
            />
            <span
              className="absolute right-0 top-0 h-0.5 transition-all duration-300 ease-out w-0 group-hover:w-1/2"
              style={{ backgroundColor: 'var(--text-primary)', transitionDelay: '300ms' }}
            />
          </a>
        </BlockReveal>
      </div>
    </div>
  );
}
