import { useRef, useState, useEffect } from 'react';

interface TypedTitleProps {
  text: string;
  className?: string;
}

export default function TypedTitle({ text, className = '' }: TypedTitleProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const containerRef = useRef<HTMLHeadingElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Find the parent section element
    const section = el.closest('section');
    const observeTarget = section || el;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTyped) {
          // Start typing only if we haven't typed yet
          setDisplayedText('');
          setIsTypingDone(false);
          
          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          let index = 0;
          
          const typeNextChar = () => {
            if (index < text.length) {
              setDisplayedText(text.slice(0, index + 1));
              const currentChar = text[index];
              index++;
              
              // Variable delays for more natural typing
              let delay = 100; // base delay
              if (index === 1) {
                delay = 280; // first letter slower (hesitation)
              } else if (currentChar === 'U') {
                delay = 220; // U is slower
              }
              
              timeoutRef.current = setTimeout(typeNextChar, delay);
            } else {
              timeoutRef.current = null;
              setIsTypingDone(true);
              setHasTyped(true);
            }
          };
          
          // Initial delay before starting
          timeoutRef.current = setTimeout(typeNextChar, 400);
        } else if (!entry.isIntersecting) {
          // Reset only when section completely leaves viewport
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setDisplayedText('');
          setIsTypingDone(false);
          setHasTyped(false);
        }
      },
      { threshold: 0 } // Triggers when any part enters/exits
    );

    observer.observe(observeTarget);
    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, hasTyped]);

  // Blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <h2
      ref={containerRef}
      className={`text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-12 ${className}`}
      style={{ color: 'var(--text-primary)', letterSpacing: '0.02em' }}
    >
      [{displayedText}
      {!isTypingDone && (
        <span style={{ opacity: showCursor ? 1 : 0 }}>_</span>
      )}]
    </h2>
  );
}
