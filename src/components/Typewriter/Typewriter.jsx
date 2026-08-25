import React, { useEffect, useState } from 'react';
import './Typewriter.css';

/**
 * Types a line of text out one character at a time, with a blinking caret.
 *
 * The whole string is in the DOM from the first frame — untyped characters are
 * `visibility: hidden`, not absent. That is what keeps the line from reflowing
 * as it types: wrapping, `text-wrap: balance` and the height of the block are
 * all decided once, against the finished text, so nothing below it moves.
 *
 * The caret is spliced in between the typed and untyped halves rather than
 * appended, or it would sit at the end of the invisible text instead of at the
 * write head.
 *
 * The two halves are plain text nodes, NOT one span per character. Per-glyph
 * spans break every kerning pair and ligature in the line, which makes a
 * heading look like it changed typeface the moment the effect is switched on.
 * Splitting the string in exactly one place — a place that moves — costs one
 * kerning pair instead of all of them.
 *
 * Screen readers get the finished string from aria-label on the wrapper and
 * never see the animation.
 *
 * Props:
 *   text          — the string to type. Changing it restarts the animation.
 *   speed         — ms per character (default 45)
 *   startDelay    — ms before the first character (default 260)
 *   start         — gate for a line that waits its turn (default true). While
 *                   false the line holds its space and shows nothing.
 *   onDone        — called once the last character lands. Sequencing two lines
 *                   off this rather than off `startDelay` arithmetic is what
 *                   keeps the hand-off exact: computed delays drift the moment
 *                   a timer is throttled, and both lines end up typing at once.
 *   persistCaret  — keep the caret blinking after the line finishes
 *                   (default true; pass false when a following line takes over)
 *   className     — extra classes on the wrapper
 */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const Typewriter = ({
  text = '',
  speed = 45,
  startDelay = 260,
  start = true,
  onDone,
  persistCaret = true,
  className = '',
}) => {
  // Spread rather than split(''), so an emoji or accented glyph stays one unit.
  const chars = [...text];

  // Read once, at mount: a visitor who has asked for less motion gets the
  // finished line with no caret and no timers at all.
  const [reduced] = useState(prefersReducedMotion);
  const [typed, setTyped] = useState(() => (prefersReducedMotion() ? chars.length : 0));

  // Restart when the text changes — the sign-in / create-account switch swaps
  // the headline under a mounted component. Adjusting during render rather
  // than in an effect keeps it to a single pass with no flash of the old line.
  const [typedFor, setTypedFor] = useState(text);
  if (typedFor !== text) {
    setTypedFor(text);
    setTyped(reduced ? chars.length : 0);
  }

  useEffect(() => {
    if (reduced || !start) return undefined;

    const total = [...text].length;
    let timer;
    const opener = setTimeout(() => {
      timer = setInterval(() => {
        setTyped((n) => {
          if (n >= total) {
            clearInterval(timer);
            return n;
          }
          return n + 1;
        });
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(opener);
      clearInterval(timer);
    };
  }, [text, speed, startDelay, start, reduced]);

  const done = typed >= chars.length;

  // Fires for the reduced-motion path too, so a following line still starts.
  useEffect(() => {
    if (done && onDone) onDone();
  }, [done, onDone]);
  // No caret before the first character — a line waiting its turn behind
  // another one should show nothing at all — and none after the last, unless
  // this is the line that keeps it.
  const showCaret = !reduced && typed > 0 && (!done || persistCaret);

  return (
    <span className={`typewriter ${className}`.trim()} aria-label={text}>
      <span aria-hidden="true">
        {chars.slice(0, typed).join('')}
        {showCaret && <span className={`typewriter-caret${done ? ' is-done' : ''}`} />}
        <span style={{ visibility: 'hidden' }}>{chars.slice(typed).join('')}</span>
      </span>
    </span>
  );
};

export default Typewriter;
