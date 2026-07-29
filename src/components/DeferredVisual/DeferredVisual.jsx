import React, { Suspense, useEffect, useRef, useState } from 'react';

const supportsIntersectionObserver = () => typeof IntersectionObserver !== 'undefined';

/**
 * Mounts a heavy (lazily imported) decorative visual only once it is about to
 * scroll into view, and only on devices that can afford it.
 *
 * The component is kept mounted afterwards — tearing a WebGL context down and
 * rebuilding it on every scroll costs more than leaving it in place, and the
 * scenes themselves pause their render loop while off screen.
 */
const DeferredVisual = ({
  component,
  enabled = true,
  rootMargin = '200px',
  className,
  style,
  ...props
}) => {
  const Visual = component;
  const holderRef = useRef(null);
  // Without IntersectionObserver there is no way to defer, so mount right away.
  const [active, setActive] = useState(() => !supportsIntersectionObserver());

  useEffect(() => {
    if (!enabled || active || !supportsIntersectionObserver()) return undefined;

    const holder = holderRef.current;
    if (!holder) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(holder);
    return () => observer.disconnect();
  }, [enabled, active, rootMargin]);

  return (
    <div ref={holderRef} className={className} style={style} aria-hidden="true">
      {enabled && active && (
        <Suspense fallback={null}>
          <Visual {...props} />
        </Suspense>
      )}
    </div>
  );
};

export default DeferredVisual;
