import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            // Unobserve after showing so it stays visible and animates only once
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px', // triggers slightly before entering screen
      }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    // Also handle initial render scan immediately for elements in viewport
    const handleInitial = setTimeout(() => {
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight) {
          el.classList.add('reveal-visible');
          observer.unobserve(el);
        }
      });
    }, 100);

    return () => {
      clearTimeout(handleInitial);
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [location.pathname]); // re-run trigger whenever route changes to bind new elements
}
