import { useState, useEffect } from 'react';
import TypedTitle from './TypedTitle';
import Project1 from './projects/Project1';
import Project2 from './projects/Project2';
import Project3 from './projects/Project3';
import Project4 from './projects/Project4';
import Project5 from './projects/Project5';

const projectComponents = [
  { id: '1', Component: Project1 },
  { id: '2', Component: Project2 },
  { id: '3', Component: Project3 },
  { id: '4', Component: Project4 },
  { id: '5', Component: Project5 },
];

export default function Portfolio() {
  const [visibleProjects, setVisibleProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = (entry.target as HTMLElement).dataset.projectId;
        if (!id) return;

        if (entry.isIntersecting) {
          setVisibleProjects((prev) => new Set([...prev, id]));
        } else {
          // Remove from visible set when leaving viewport
          setVisibleProjects((prev) => {
            const updated = new Set(prev);
            updated.delete(id);
            return updated;
          });
        }
      });
    }, observerOptions);

    const projectElements = document.querySelectorAll('[data-project-id]');
    projectElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      projectElements.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);

  return (
    <section
      id="portfolio"
      className="relative px-4 sm:px-6 py-12 sm:py-16 md:py-24 z-20 mx-4 sm:mx-8 md:mx-16 lg:mx-32 my-16 sm:my-24 md:my-32 min-h-screen"
      style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="w-full mx-auto">
        <TypedTitle text="PORTFOLIO" className="mb-12 sm:mb-16 md:mb-20" />

        {/* Vertical Zig-Zag Layout */}
        <div className="space-y-16 sm:space-y-20 md:space-y-24">
          {projectComponents.map(({ id, Component }, index) => {
            const isEven = index % 2 === 0;
            const isVisible = visibleProjects.has(id);

            return (
              <div key={id} data-project-id={id}>
                <Component isEven={isEven} isVisible={isVisible} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
