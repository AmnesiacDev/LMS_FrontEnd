import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import './Pet.css';

/* ══════════════════════════════════════════════════════════════════
   SVG PIXEL CREATURES
══════════════════════════════════════════════════════════════════ */
const ShibaSvg = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    <rect x="4" y="9" width="8" height="5" fill="#e8922a"/>
    <rect x="3" y="4" width="10" height="7" fill="#e8922a"/>
    <rect x="3" y="2" width="3" height="3" fill="#e8922a"/>
    <rect x="10" y="2" width="3" height="3" fill="#e8922a"/>
    <rect x="4" y="3" width="1" height="1" fill="#c0622a"/>
    <rect x="11" y="3" width="1" height="1" fill="#c0622a"/>
    <rect x="4" y="7" width="8" height="3" fill="#f5d9a8"/>
    <rect x="5" y="5" width="2" height="2" fill="#1a1a1a"/>
    <rect x="9" y="5" width="2" height="2" fill="#1a1a1a"/>
    <rect x="5" y="5" width="1" height="1" fill="#fff"/>
    <rect x="9" y="5" width="1" height="1" fill="#fff"/>
    <rect x="7" y="8" width="2" height="1" fill="#1a1a1a"/>
    <rect x="6" y="9" width="1" height="1" fill="#c0622a"/>
    <rect x="9" y="9" width="1" height="1" fill="#c0622a"/>
    <rect x="12" y="7" width="2" height="4" fill="#e8922a"/>
    <rect x="13" y="5" width="2" height="3" fill="#e8922a"/>
    <rect x="4" y="13" width="2" height="2" fill="#c0622a"/>
    <rect x="10" y="13" width="2" height="2" fill="#c0622a"/>
  </svg>
);

const AxolotlSvg = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    <rect x="3" y="7" width="10" height="6" fill="#e8607a"/>
    <rect x="4" y="4" width="8" height="6" fill="#e8607a"/>
    <rect x="2" y="3" width="2" height="4" fill="#ff8fa3"/>
    <rect x="12" y="3" width="2" height="4" fill="#ff8fa3"/>
    <rect x="1" y="2" width="1" height="3" fill="#ff8fa3"/>
    <rect x="14" y="2" width="1" height="3" fill="#ff8fa3"/>
    <rect x="5" y="5" width="2" height="2" fill="#1a1a1a"/>
    <rect x="9" y="5" width="2" height="2" fill="#1a1a1a"/>
    <rect x="5" y="5" width="1" height="1" fill="#fff"/>
    <rect x="9" y="5" width="1" height="1" fill="#fff"/>
    <rect x="6" y="8" width="4" height="1" fill="#c0304a"/>
    <rect x="5" y="7" width="1" height="1" fill="#c0304a"/>
    <rect x="10" y="7" width="1" height="1" fill="#c0304a"/>
    <rect x="3" y="12" width="2" height="2" fill="#c0304a"/>
    <rect x="11" y="12" width="2" height="2" fill="#c0304a"/>
    <rect x="6" y="13" width="4" height="2" fill="#e8607a"/>
    <rect x="7" y="15" width="2" height="1" fill="#ff8fa3"/>
  </svg>
);

const RobotSvg = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    <rect x="3" y="8" width="10" height="6" fill="#5a7fa8"/>
    <rect x="4" y="9" width="8" height="4" fill="#4a6f98"/>
    <rect x="6" y="10" width="4" height="2" fill="#7dd3fc"/>
    <rect x="4" y="3" width="8" height="6" fill="#5a7fa8"/>
    <rect x="3" y="4" width="10" height="4" fill="#6a8fb8"/>
    <rect x="7" y="1" width="2" height="2" fill="#5a7fa8"/>
    <rect x="7" y="0" width="2" height="1" fill="#fbbf24"/>
    <rect x="5" y="5" width="2" height="2" fill="#7dd3fc"/>
    <rect x="9" y="5" width="2" height="2" fill="#7dd3fc"/>
    <rect x="5" y="5" width="1" height="1" fill="#fff"/>
    <rect x="9" y="5" width="1" height="1" fill="#fff"/>
    <rect x="5" y="8" width="6" height="1" fill="#1a1a1a"/>
    <rect x="6" y="8" width="1" height="1" fill="#7dd3fc"/>
    <rect x="8" y="8" width="1" height="1" fill="#7dd3fc"/>
    <rect x="10" y="8" width="1" height="1" fill="#7dd3fc"/>
    <rect x="1" y="9" width="2" height="4" fill="#5a7fa8"/>
    <rect x="13" y="9" width="2" height="4" fill="#5a7fa8"/>
    <rect x="4" y="14" width="3" height="2" fill="#4a6f98"/>
    <rect x="9" y="14" width="3" height="2" fill="#4a6f98"/>
  </svg>
);

const GhostSvg = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    <rect x="3" y="5" width="10" height="8" fill="#e2e8f0"/>
    <rect x="2" y="7" width="12" height="5" fill="#e2e8f0"/>
    <rect x="4" y="3" width="3" height="3" fill="#e2e8f0"/>
    <rect x="9" y="3" width="3" height="3" fill="#e2e8f0"/>
    <rect x="6" y="2" width="4" height="3" fill="#e2e8f0"/>
    <rect x="3" y="13" width="2" height="2" fill="#e2e8f0"/>
    <rect x="7" y="13" width="2" height="2" fill="#e2e8f0"/>
    <rect x="11" y="13" width="2" height="2" fill="#e2e8f0"/>
    <rect x="5" y="7" width="2" height="2" fill="#334155"/>
    <rect x="9" y="7" width="2" height="2" fill="#334155"/>
    <rect x="5" y="7" width="1" height="1" fill="#94a3b8"/>
    <rect x="9" y="7" width="1" height="1" fill="#94a3b8"/>
    <rect x="4" y="9" width="2" height="1" fill="#fca5a5" opacity="0.7"/>
    <rect x="10" y="9" width="2" height="1" fill="#fca5a5" opacity="0.7"/>
    <rect x="6" y="10" width="4" height="1" fill="#334155"/>
    <rect x="5" y="9" width="1" height="1" fill="#334155"/>
    <rect x="10" y="9" width="1" height="1" fill="#334155"/>
  </svg>
);

const CactusSvg = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    <rect x="4" y="12" width="8" height="4" fill="#c0622a"/>
    <rect x="3" y="11" width="10" height="2" fill="#a0522a"/>
    <rect x="6" y="3" width="4" height="9" fill="#22c55e"/>
    <rect x="3" y="6" width="3" height="2" fill="#22c55e"/>
    <rect x="3" y="4" width="2" height="3" fill="#22c55e"/>
    <rect x="10" y="7" width="3" height="2" fill="#22c55e"/>
    <rect x="11" y="5" width="2" height="3" fill="#22c55e"/>
    <rect x="5" y="5" width="1" height="1" fill="#86efac"/>
    <rect x="10" y="6" width="1" height="1" fill="#86efac"/>
    <rect x="7" y="1" width="2" height="2" fill="#f9a8d4"/>
    <rect x="6" y="2" width="1" height="1" fill="#f9a8d4"/>
    <rect x="9" y="2" width="1" height="1" fill="#f9a8d4"/>
    <rect x="7" y="2" width="2" height="1" fill="#fbbf24"/>
    <rect x="7" y="6" width="1" height="1" fill="#166534"/>
    <rect x="9" y="6" width="1" height="1" fill="#166534"/>
    <rect x="7" y="8" width="3" height="1" fill="#166534"/>
  </svg>
);

const SlimeSvg = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    <rect x="4" y="6" width="8" height="7" fill="#38bdf8"/>
    <rect x="3" y="8" width="10" height="4" fill="#38bdf8"/>
    <rect x="6" y="3" width="4" height="4" fill="#38bdf8"/>
    <rect x="7" y="2" width="2" height="2" fill="#38bdf8"/>
    <rect x="7" y="1" width="2" height="1" fill="#7dd3fc"/>
    <rect x="5" y="13" width="2" height="2" fill="#38bdf8"/>
    <rect x="9" y="13" width="2" height="2" fill="#38bdf8"/>
    <rect x="7" y="14" width="2" height="1" fill="#7dd3fc"/>
    <rect x="5" y="8" width="2" height="2" fill="#0c4a6e"/>
    <rect x="9" y="8" width="2" height="2" fill="#0c4a6e"/>
    <rect x="5" y="8" width="1" height="1" fill="#7dd3fc"/>
    <rect x="9" y="8" width="1" height="1" fill="#7dd3fc"/>
    <rect x="6" y="11" width="4" height="1" fill="#0c4a6e"/>
    <rect x="5" y="10" width="1" height="1" fill="#0c4a6e"/>
    <rect x="10" y="10" width="1" height="1" fill="#0c4a6e"/>
    <rect x="10" y="6" width="2" height="2" fill="#bae6fd" opacity="0.6"/>
  </svg>
);

const DinoSvg = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    <rect x="4" y="7" width="8" height="6" fill="#4ade80"/>
    <rect x="7" y="3" width="7" height="5" fill="#4ade80"/>
    <rect x="12" y="5" width="3" height="3" fill="#4ade80"/>
    <rect x="14" y="6" width="2" height="1" fill="#166534"/>
    <rect x="4" y="5" width="2" height="2" fill="#22c55e"/>
    <rect x="5" y="4" width="2" height="2" fill="#22c55e"/>
    <rect x="6" y="3" width="2" height="2" fill="#22c55e"/>
    <rect x="10" y="4" width="2" height="2" fill="#1a1a1a"/>
    <rect x="10" y="4" width="1" height="1" fill="#fff"/>
    <rect x="5" y="9" width="5" height="3" fill="#86efac"/>
    <rect x="5" y="13" width="2" height="2" fill="#22c55e"/>
    <rect x="9" y="13" width="2" height="2" fill="#22c55e"/>
    <rect x="2" y="9" width="3" height="2" fill="#4ade80"/>
    <rect x="1" y="10" width="2" height="2" fill="#4ade80"/>
  </svg>
);

const CupcakeSvg = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
    <rect x="4" y="10" width="8" height="5" fill="#c0622a"/>
    <rect x="5" y="11" width="6" height="3" fill="#a0522a"/>
    <rect x="5" y="11" width="2" height="3" fill="#c0622a"/>
    <rect x="9" y="11" width="2" height="3" fill="#c0622a"/>
    <rect x="3" y="7" width="10" height="4" fill="#f9a8d4"/>
    <rect x="4" y="6" width="8" height="2" fill="#f9a8d4"/>
    <rect x="5" y="5" width="6" height="2" fill="#fce7f3"/>
    <rect x="6" y="4" width="4" height="2" fill="#fce7f3"/>
    <rect x="5" y="8" width="1" height="1" fill="#fbbf24"/>
    <rect x="8" y="7" width="1" height="1" fill="#60a5fa"/>
    <rect x="11" y="8" width="1" height="1" fill="#4ade80"/>
    <rect x="7" y="9" width="1" height="1" fill="#f87171"/>
    <rect x="7" y="2" width="2" height="2" fill="#ef4444"/>
    <rect x="8" y="1" width="1" height="2" fill="#22c55e"/>
    <rect x="6" y="8" width="1" height="1" fill="#9d174d"/>
    <rect x="9" y="8" width="1" height="1" fill="#9d174d"/>
    <rect x="7" y="9" width="2" height="1" fill="#9d174d"/>
  </svg>
);


/* ══════════════════════════════════════════════════════════════════
   CREATURE REGISTRY
   Each entry defines:
     idleAnim   — CSS animation string for the idle state
     clickAnim  — CSS animation string when clicked
     hoverAnim  — CSS animation string on hover
     glowColor  — colour for the hover glow (used via --pet-glow)
     messages   — things the pet says when clicked
══════════════════════════════════════════════════════════════════ */
const CREATURES = [
  {
    id: 'shiba',
    name: 'Shiba',
    emoji: '🐕',
    Svg: ShibaSvg,
    glowColor: '#f59e0b',
    idleAnim:  'petStomp 1.8s ease-in-out infinite',
    clickAnim: 'petJump 0.55s cubic-bezier(0.36,0.07,0.19,0.97) forwards',
    hoverAnim: 'petShake 0.4s ease-in-out infinite',
    messages: ['Woof!', 'Much study!', 'Very smart!', 'Good boy!', 'Doge approves!', 'Such focus!'],
  },
  {
    id: 'axolotl',
    name: 'Axolotl',
    emoji: '🦎',
    Svg: AxolotlSvg,
    glowColor: '#f472b6',
    idleAnim:  'petBob 2s ease-in-out infinite',
    clickAnim: 'petJump 0.55s cubic-bezier(0.36,0.07,0.19,0.97) forwards',
    hoverAnim: 'petPulse 0.5s ease-in-out infinite',
    messages: ['Blub blub!', 'Axo-lot of effort!', 'Keep going!', '*wiggles gills*', 'You got this!', 'Regenerating...'],
  },
  {
    id: 'robot',
    name: 'Robot',
    emoji: '🤖',
    Svg: RobotSvg,
    glowColor: '#38bdf8',
    idleAnim:  'petSpin 3s ease-in-out infinite',
    clickAnim: 'petShake 0.4s ease-in-out 2',
    hoverAnim: 'petPulse 0.6s ease-in-out infinite',
    messages: ['BEEP BOOP', 'Calculating...', '01000111 01000111', 'Processing task...', 'Recharging!', 'Error: too cool'],
  },
  {
    id: 'ghost',
    name: 'Ghost',
    emoji: '👻',
    Svg: GhostSvg,
    glowColor: '#a5b4fc',
    idleAnim:  'petFloat 3s ease-in-out infinite',
    clickAnim: 'petJump 0.55s cubic-bezier(0.36,0.07,0.19,0.97) forwards',
    hoverAnim: 'petWiggle 0.5s ease-in-out infinite',
    messages: ['Boo!', 'Haunt the exam!', 'BOO-tiful work!', '*floats away*', 'Spooky smart!', 'I believe in you~'],
  },
  {
    id: 'cactus',
    name: 'Cactus',
    emoji: '🌵',
    Svg: CactusSvg,
    glowColor: '#4ade80',
    idleAnim:  'petSway 2.5s ease-in-out infinite',
    clickAnim: 'petJump 0.55s cubic-bezier(0.36,0.07,0.19,0.97) forwards',
    hoverAnim: 'petPulse 0.7s ease-in-out infinite',
    messages: ['Stay sharp!', 'Prickly but proud!', 'Grow every day!', '*blooms*', "You're un-be-leaf-able!", 'Rooted in success!'],
  },
  {
    id: 'slime',
    name: 'Slime',
    emoji: '💧',
    Svg: SlimeSvg,
    glowColor: '#38bdf8',
    idleAnim:  'petDrip 1.6s ease-in-out infinite',
    clickAnim: 'petBob 0.4s ease-in-out 2',
    hoverAnim: 'petPulse 0.5s ease-in-out infinite',
    messages: ['Bloop!', '*jiggles*', 'Stay fluid!', 'Ooze into it!', 'Slime time!', 'Dripping with talent!'],
  },
  {
    id: 'dino',
    name: 'Dino',
    emoji: '🦕',
    Svg: DinoSvg,
    glowColor: '#4ade80',
    idleAnim:  'petStomp 1.4s ease-in-out infinite',
    clickAnim: 'petJump 0.7s cubic-bezier(0.36,0.07,0.19,0.97) forwards',
    hoverAnim: 'petShake 0.35s ease-in-out infinite',
    messages: ['RAWR!', 'Dino-mite!', '*stomps*', 'Jurassic grades!', 'Extinct-ly smart!', 'T-REX the test!'],
  },
  {
    id: 'cupcake',
    name: 'Cupcake',
    emoji: '🧁',
    Svg: CupcakeSvg,
    glowColor: '#f9a8d4',
    idleAnim:  'petBob 2.2s ease-in-out infinite',
    clickAnim: 'petSpin 0.5s ease-in-out forwards',
    hoverAnim: 'petWiggle 0.5s ease-in-out infinite',
    messages: ["You're a treat!", 'Sweet effort!', 'Sprinkle hard work!', '*sparkles*', 'Icing on top!', 'Baked to perfection!'],
  },
];

const STORAGE_KEY = 'lms-pet-choice';

/* The sprite is ~20 <rect> nodes. Memoising on the component identity keeps
   React from reconciling all of them every time the pet is hovered or clicked. */
const Sprite = React.memo((props) => {
  const Svg = props.svg;
  return <Svg />;
});
Sprite.displayName = 'Sprite';

/* ══════════════════════════════════════════════════════════════════
   PET PICKER PANEL — dark card style matching the screenshot
══════════════════════════════════════════════════════════════════ */
const PetPicker = ({ current, onSelect, onClose }) => (
  <div style={{
    position: 'absolute',
    bottom: '88px',
    right: 0,
    width: '300px',
    background: '#1a1a2e',
    border: '3px solid #2d2d4e',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
    padding: '1rem',
    zIndex: 10000,
    animation: 'fadeIn 0.18s ease',
  }}>
    {/* Header */}
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.85rem',
    }}>
      <span style={{
        fontWeight: 900,
        fontSize: '1rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#ffffff',
        fontFamily: 'var(--font-body)',
      }}>
        Choose your pet
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px',
          width: '28px',
          height: '28px',
          cursor: 'pointer',
          color: '#aaa',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#aaa'; }}
      >✕</button>
    </div>

    {/* Grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
    }}>
      {CREATURES.map((c) => {
        const isSelected = current === c.id;
        return (
          <button
            key={c.id}
            onClick={() => { onSelect(c.id); onClose(); }}
            title={c.name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '4px',
              padding: '8px 4px 6px',
              border: isSelected ? `2px solid ${c.glowColor}` : '2px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              background: isSelected
                ? `linear-gradient(160deg, ${c.glowColor}33, ${c.glowColor}11)`
                : 'rgba(255,255,255,0.05)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: isSelected ? `0 0 12px ${c.glowColor}55, inset 0 0 8px ${c.glowColor}22` : 'none',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '72px',
            }}
            onMouseEnter={e => {
              if (!isSelected) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }
            }}
            onMouseLeave={e => {
              if (!isSelected) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }
            }}
          >
            {/* Selected indicator dot */}
            {isSelected && (
              <div style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: c.glowColor,
                boxShadow: `0 0 6px ${c.glowColor}`,
              }} />
            )}

            {/* Sprite — bigger in picker */}
            <div style={{
              width: '48px',
              height: '48px',
              imageRendering: 'pixelated',
              filter: isSelected ? `drop-shadow(0 0 6px ${c.glowColor})` : 'none',
              transition: 'filter 0.2s ease',
            }}>
              <c.Svg />
            </div>

            {/* Name */}
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              color: isSelected ? c.glowColor : 'rgba(255,255,255,0.55)',
              textAlign: 'center',
              lineHeight: 1.2,
              letterSpacing: '0.02em',
              fontFamily: 'var(--font-body)',
            }}>
              {c.name}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   MAIN PET COMPONENT
══════════════════════════════════════════════════════════════════ */
const Pet = () => {
  const [petId, setPetId] = useState(() => localStorage.getItem(STORAGE_KEY) || 'shiba');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [bubble, setBubble] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const animTimeout = useRef(null);
  const bubbleTimeout = useRef(null);

  const creature = CREATURES.find(c => c.id === petId) || CREATURES[0];

  const handleSelect = useCallback((id) => {
    setPetId(id);
    localStorage.setItem(STORAGE_KEY, id);
    setIsAnimating(false);
    setBubble(null);
  }, []);

  const handleClick = useCallback(() => {
    if (showPicker) return;
    if (isAnimating) return;

    setIsAnimating(true);
    const msg = creature.messages[Math.floor(Math.random() * creature.messages.length)];
    setBubble(msg);

    clearTimeout(animTimeout.current);
    clearTimeout(bubbleTimeout.current);

    // Most click anims are ~0.5s; give a bit of buffer
    animTimeout.current = setTimeout(() => setIsAnimating(false), 700);
    bubbleTimeout.current = setTimeout(() => setBubble(null), 2400);
  }, [showPicker, isAnimating, creature]);

  // Cleanup on unmount
  useEffect(() => () => {
    clearTimeout(animTimeout.current);
    clearTimeout(bubbleTimeout.current);
  }, []);

  /* Pick the right animation */
  let spriteAnim = creature.idleAnim;
  if (isAnimating) spriteAnim = creature.clickAnim;
  else if (isHovered && !showPicker) spriteAnim = creature.hoverAnim;

  const showGlow = isHovered && !isAnimating;
  const spriteStyle = useMemo(
    () => ({ animation: spriteAnim, '--pet-glow': creature.glowColor }),
    [spriteAnim, creature.glowColor],
  );

  return (
    <div className="pet-root">
      {/* Picker panel */}
      {showPicker && (
        <PetPicker
          current={petId}
          onSelect={handleSelect}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Speech bubble */}
      {bubble && !showPicker && (
        <div className="pet-bubble" style={{ color: creature.glowColor }}>
          {bubble}
        </div>
      )}

      {/* Sprite wrapper — click to talk, right-click / long-press opens picker */}
      <div
        className="pet-hit"
        onClick={handleClick}
        onContextMenu={(e) => { e.preventDefault(); setShowPicker(p => !p); }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Pet: ${creature.name}. Click to interact, right-click to change.`}
        title="Click to interact · Right-click to change pet"
      >
        <div
          className={`pet-sprite${showGlow ? ' pet-sprite--glow' : ''}`}
          style={spriteStyle}
        >
          <Sprite svg={creature.Svg} />
        </div>

        {/* Change-pet button (visible on hover) */}
        {isHovered && (
          <button
            type="button"
            className="pet-swap-btn"
            onClick={(e) => { e.stopPropagation(); setShowPicker(p => !p); }}
            title="Change pet"
          >
            🔄
          </button>
        )}
      </div>

      {/* Shadow */}
      <div
        className={`pet-shadow${isAnimating ? ' pet-shadow--pulse' : ''}${
          isHovered ? ' pet-shadow--wide' : ''
        }`}
      />
    </div>
  );
};

// The dashboard layout re-renders on every navigation; the pet does not need to.
export default React.memo(Pet);
