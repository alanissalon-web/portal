import { useEffect, useRef, useState, useCallback } from 'react';

export function useMultiScrollReveal(count: number, threshold = 0.15) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState<boolean[]>(new Array(count).fill(false));

  const setRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    refs.current[index] = el;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = refs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) {
              setVisible(prev => {
                const next = [...prev];
                next[idx] = true;
                return next;
              });
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    refs.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [count, threshold]);

  return { setRef, visible };
}
