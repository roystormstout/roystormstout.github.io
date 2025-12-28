import { useEffect, useRef, useState } from 'react';

interface ResumeSectionProps {
  title: string;
  items: Array<{
    [key: string]: string;
  }>;
  titleKey: string;
  subtitleKey: string;
}

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

interface ResumeArticleProps {
  item: { [key: string]: string };
  index: number;
  titleKey: string;
  subtitleKey: string;
}

function ResumeArticle({ item, index, titleKey, subtitleKey }: ResumeArticleProps) {
  const articleRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasAnimated(true);
          setAnimationKey((prev) => prev + 1);
        } else {
          setIsVisible(false);
          setHasAnimated(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={articleRef}
      className="cyber-card rounded-lg p-4 sm:p-6 m-2 sm:m-6 lg:m-16"
      style={{
        opacity: hasAnimated ? 1 : 0,
        transform: hasAnimated ? 'translateX(0)' : 'translateX(-20px)',
        transition: isVisible ? 'opacity 0.5s ease, transform 0.5s ease' : 'none',
      }}
    >
      {/* Cyber corners */}
      <div className="cyber-corner cyber-corner-tl" />
      <div className="cyber-corner cyber-corner-tr" />
      <div className="cyber-corner cyber-corner-bl" />
      <div className="cyber-corner cyber-corner-br" />

      <div className="relative z-10">
        <h4
          className="text-2xl md:text-3xl font-bold cyber-title"
          style={{ color: 'var(--text-primary)' }}
        >
          <BlockReveal
            key={`itemTitle-${index}-${animationKey}`}
            isVisible={isVisible}
            delay={0}
            blockColor="block-amber"
          >
            <span className="cyber-glitch-text" data-text={item[titleKey]}>
              {item[titleKey]}
            </span>
          </BlockReveal>
        </h4>
        <p className="text-lg md:text-xl font-bold mt-3">
          <BlockReveal
            key={`subtitle-${index}-${animationKey}`}
            isVisible={isVisible}
            delay={1}
            blockColor="block-cyan"
          >
            <span
              style={{
                color: item.color,
                textShadow: `0 0 10px ${item.color}`,
              }}
            >
              {item[subtitleKey]}
            </span>
          </BlockReveal>
        </p>
        <p className="text-base md:text-lg mt-2">
          <BlockReveal
            key={`period-${index}-${animationKey}`}
            isVisible={isVisible}
            delay={2}
            blockColor="block-magenta"
          >
            <span style={{ color: 'var(--accent-magenta)', textShadow: '0 0 5px var(--accent-magenta)' }}>
              {item.period}
            </span>
          </BlockReveal>
        </p>
        <p className="mt-4 text-base md:text-lg">
          <BlockReveal
            key={`desc-${index}-${animationKey}`}
            isVisible={isVisible}
            delay={3}
            blockColor="block-white"
          >
            <span style={{ color: 'var(--text-secondary)' }}>{item.description}</span>
          </BlockReveal>
        </p>
      </div>
    </article>
  );
}

export default function ResumeSection({
  title,
  items,
  titleKey,
  subtitleKey,
}: ResumeSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Increment key to force re-render and restart animations
          setAnimationKey((prev) => prev + 1);
          setIsVisible(true);
        } else {
          // Reset animation when leaving viewport
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef}>
      <h3
        className="text-3xl md:text-4xl font-bold mb-8 cyber-section-title"
        style={{ color: 'var(--accent-cyan)' }}
      >
        <BlockReveal key={`title-${animationKey}`} isVisible={isVisible} delay={0} blockColor="block-cyan">
          <span className="cyber-glitch-text" data-text={`> ${title}`}>
            &gt; {title}
          </span>
        </BlockReveal>
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16">
        {items.map((item, i) => (
          <ResumeArticle
            key={`${item[subtitleKey]}-${i}`}
            item={item}
            index={i}
            titleKey={titleKey}
            subtitleKey={subtitleKey}
          />
        ))}
      </div>
    </div>
  );
}
