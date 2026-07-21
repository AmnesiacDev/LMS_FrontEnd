import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';
import './CosmicScene.css';

const TEX = '/textures/earth/';

/* Programming-language glyphs baked from Font Awesome (already loaded in index.html).
   `b` = brands family (weight 400) vs. free-solid (weight 900). Colours are the real
   brand hues so the tunnel reads as a genuine tech stack, not random confetti.
   Codepoints are Font Awesome 6.5.1 private-use characters. */
const LOGOS = [
  { ch: '', b: true,  color: '#4B8BBE' }, // python
  { ch: '', b: true,  color: '#F7DF1E' }, // js
  { ch: '', b: true,  color: '#E34F26' }, // html5
  { ch: '', b: true,  color: '#2965F1' }, // css3-alt
  { ch: '', b: true,  color: '#F05032' }, // git-alt
  { ch: '', b: true,  color: '#5FA04E' }, // node-js
  { ch: '', b: true,  color: '#61DAFB' }, // react
  { ch: '', b: true,  color: '#F89820' }, // java
  { ch: '', b: true,  color: '#8892BF' }, // php
  { ch: '', b: true,  color: '#2496ED' }, // docker
  { ch: '', b: true,  color: '#CC6699' }, // sass
  { ch: '', b: true,  color: '#E6EDF3' }, // github
  { ch: '', b: false, color: '#7EE7C7' }, // terminal
  { ch: '', b: false, color: '#FCD34D' }, // database
  { ch: '', b: false, color: '#93C5FD' }, // code
  { ch: '', b: false, color: '#A78BFA' }, // laptop-code
];

const bakeGlyph = (glyph) => {
  const S = 128;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, S, S);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${glyph.b ? 400 : 900} 78px "${glyph.b ? 'Font Awesome 6 Brands' : 'Font Awesome 6 Free'}"`;
  // Soft outer glow so a flat sprite still feels luminous.
  ctx.shadowColor = glyph.color;
  ctx.shadowBlur = 22;
  ctx.fillStyle = glyph.color;
  ctx.fillText(glyph.ch, S / 2, S / 2 + 4);
  ctx.shadowBlur = 0;
  // Dark rim: reads as edge definition against deep space, but it is the only
  // thing keeping near-white marks (GitHub, terminal) visible once the daylight
  // theme turns the sky pale.
  ctx.lineJoin = 'round';
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(10, 16, 32, 0.72)';
  ctx.strokeText(glyph.ch, S / 2, S / 2 + 4);
  ctx.fillText(glyph.ch, S / 2, S / 2 + 4); // final pass sharpens the core
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 2;
  return tex;
};

// Radial flare used as the visible sun in the daylight theme.
const bakeSun = () => {
  const S = 256;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0.00, 'rgba(255, 255, 255, 1)');
  g.addColorStop(0.05, 'rgba(255, 253, 242, 1)');
  g.addColorStop(0.09, 'rgba(255, 244, 206, 0.90)');
  g.addColorStop(0.19, 'rgba(255, 223, 152, 0.40)');
  g.addColorStop(0.40, 'rgba(255, 201, 121, 0.13)');
  g.addColorStop(1.00, 'rgba(255, 190, 110, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

// Box–Muller — used to scatter stars around the galactic plane.
const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

const EARTH_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const EARTH_FRAG = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D specMap;
  uniform sampler2D normalMap;
  uniform vec3 sunDir;
  uniform float normalStrength;
  uniform float dayMix; // 0 = deep-space theme, 1 = daylight theme
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;

  // Tangent-free normal perturbation (screen-space derivatives).
  vec3 perturb(vec3 N, vec2 uv) {
    vec3 dp1 = dFdx(vWorldPos);
    vec3 dp2 = dFdy(vWorldPos);
    vec2 duv1 = dFdx(uv);
    vec2 duv2 = dFdy(uv);
    vec3 dp2perp = cross(dp2, N);
    vec3 dp1perp = cross(N, dp1);
    vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
    vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;
    float invmax = inversesqrt(max(dot(T, T), dot(B, B)));
    mat3 TBN = mat3(T * invmax, B * invmax, N);
    vec3 mN = texture2D(normalMap, uv).xyz * 2.0 - 1.0;
    mN.xy *= normalStrength;
    return normalize(TBN * mN);
  }

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(vViewDir);
    vec3 Np = perturb(N, vUv);

    float ndl = dot(Np, sunDir);
    float term = smoothstep(-0.16, 0.36, ndl);
    // Daylight theme floods the globe: the terminator all but closes so the
    // whole disc reads as sunlit rather than half-swallowed by night.
    float dayAmt = mix(term, mix(term, 1.0, 0.88), dayMix);

    float ocean = texture2D(specMap, vUv).r;
    vec3 day = texture2D(dayMap, vUv).rgb;
    // The bathymetry plate paints open water almost black. Real oceans owe most
    // of their colour to scattered blue, so put that back or the marble reads
    // like a grey moon.
    day += vec3(0.03, 0.09, 0.20) * ocean * (0.35 + 0.65 * dayMix);

    vec3 night = texture2D(nightMap, vUv).rgb;

    // City lights only bleed through on the night side, and only after dark.
    vec3 nightGlow = night * 1.7 * smoothstep(0.08, -0.28, ndl) * (1.0 - dayMix);
    vec3 lit = mix(day * (0.46 + 1.35 * max(ndl, 0.0)),
                   day * (1.00 + 1.00 * max(ndl, 0.0)), dayMix);
    vec3 surface = mix(nightGlow, lit, dayAmt);

    // A pinpoint sun glint on open water (geometric normal keeps it clean).
    vec3 R = reflect(-sunDir, N);
    float spec = pow(max(dot(R, V), 0.0), 260.0) * ocean * term;
    surface += vec3(1.0, 0.92, 0.70) * spec * (0.55 + 0.35 * dayMix);
    surface *= mix(vec3(1.0), vec3(1.06, 1.03, 0.98), dayMix); // warm noon cast

    gl_FragColor = vec4(surface, 1.0);
  }
`;

const STAR_VERT = /* glsl */ `
  attribute float size;
  attribute float phase;
  attribute float bright;
  attribute vec3 starColor;
  uniform float time;
  uniform float dayMix;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    // Real starlight scintillates only slightly — keep the flicker restrained.
    float tw = 0.80 + 0.20 * sin(time * 1.3 + phase);
    // Daylight drowns the whole vault, exactly as it does from orbit.
    vColor = starColor;
    vAlpha = bright * tw * (1.0 - dayMix);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const STAR_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    // Tight core plus a faint halo reads as a point source, not a fuzzy blob.
    float core = smoothstep(0.5, 0.08, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.30;
    gl_FragColor = vec4(vColor, (core * core + halo) * vAlpha);
  }
`;

const CosmicScene = ({ variant = 'home' }) => {
  const mountRef = useRef(null);
  const themeApi = useTheme();
  const theme = themeApi?.theme === 'dark' ? 'dark' : 'light';
  // The scene is expensive to build, so a theme flip must not re-run the setup
  // effect. It hands a setter out through this ref instead.
  const applyThemeRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const small = window.innerWidth < 720;

    // `drift` moves the logo tunnel on its own clock. The landing pages scrub it
    // with scroll and leave it at 0; /login barely scrolls, so it needs a motor.
    const CFG = {
      about: { base: new THREE.Vector3(2.1, 0.3, -0.8), radius: 2.5, riseY: 2.2, riseX: 1.0, riseZ: 1.0, shrink: 0.46, cycles: 2.2, logoCount: small ? 12 : 20, drift: 0 },
      // Auth keeps the globe left of the form card. On phones the card takes the
      // whole width, so the globe retreats to a crescent above it instead.
      auth: small
        ? { base: new THREE.Vector3(-0.8, 2.6, -1.6), radius: 2.4, riseY: 1.6, riseX: 0.4, riseZ: 1.0, shrink: 0.35, cycles: 1.4, logoCount: 10, drift: 1.8 }
        : { base: new THREE.Vector3(-3.0, -1.05, -0.7), radius: 2.9, riseY: 1.2, riseX: 0.5, riseZ: 0.8, shrink: 0.30, cycles: 1.2, logoCount: 16, drift: 2.4 },
      home: { base: new THREE.Vector3(1.9, -1.35, 0), radius: 3.6, riseY: 3.0, riseX: 1.2, riseZ: 1.6, shrink: 0.6, cycles: 3.0, logoCount: small ? 16 : 30, drift: 0 },
    };
    const cfg = CFG[variant] || CFG.home;

    let renderer;
    try {
      // alpha:true lets the themed CSS gradient on the mount act as the sky, so
      // the day/night backdrop cross-fades in CSS instead of snapping in GL.
      renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: 'high-performance' });
    } catch {
      mount.classList.add('cosmic--failed');
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070f, 0.0075);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
    camera.position.set(0, 0, 9);

    // Lateral sun: right hemisphere in daylight, left slips into night (city
    // lights), and the ocean glint stays a localised spot instead of a wash.
    const sunDir = new THREE.Vector3(0.82, 0.22, 0.28).normalize();
    const ambient = new THREE.AmbientLight(0x223044, 1.1);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff2dd, 2.2);
    sun.position.copy(sunDir).multiplyScalar(10);
    scene.add(sun);

    // Theme palette. dayMix drives every one of these in the frame loop.
    const NIGHT_FOG = new THREE.Color(0x05070f);
    const DAY_FOG = new THREE.Color(0xc4dbf4);
    const NIGHT_AMB = new THREE.Color(0x223044);
    const DAY_AMB = new THREE.Color(0xc3d8f2);
    let dayTarget = 0;
    let dayMix = 0;

    /* ---------- Earth ---------- */
    const earthPivot = new THREE.Group();
    earthPivot.position.copy(cfg.base);
    scene.add(earthPivot);

    const earthSpin = new THREE.Group(); // holds axial tilt + user-drag rotation
    earthSpin.rotation.z = THREE.MathUtils.degToRad(23.4);
    earthPivot.add(earthSpin);

    const loader = new THREE.TextureLoader();
    const srgb = (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
    const lin = (t) => { t.colorSpace = THREE.NoColorSpace; return t; };

    // NASA imagery: Blue Marble Next Generation (topography + bathymetry) for
    // the day side, Black Marble 2012 for city lights.
    const earthUniforms = {
      dayMap: { value: srgb(loader.load(TEX + 'earth_day_4096.jpg')) },
      nightMap: { value: srgb(loader.load(TEX + 'earth_night_2048.jpg')) },
      specMap: { value: lin(loader.load(TEX + 'earth_specular_2048.jpg')) },
      normalMap: { value: lin(loader.load(TEX + 'earth_normal_2048.jpg')) },
      sunDir: { value: sunDir },
      normalStrength: { value: 0.22 },
      dayMix: { value: 0 },
    };

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(cfg.radius, 96, 96),
      new THREE.ShaderMaterial({ vertexShader: EARTH_VERT, fragmentShader: EARTH_FRAG, uniforms: earthUniforms }),
    );
    earthSpin.add(earth);

    // NASA's combined cloud cover, stored greyscale. alphaMap samples the GREEN
    // channel, which for a greyscale source is exactly the coverage value.
    const cloudTex = lin(loader.load(TEX + 'earth_clouds_2048.jpg'));
    cloudTex.anisotropy = 4;
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      alphaMap: cloudTex,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      roughness: 1,
      metalness: 0,
    });
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(cfg.radius * 1.012, 64, 64), cloudMat);
    earthSpin.add(clouds);

    /* ---------- Sun (daylight theme only) ---------- */
    // Placed for composition rather than strict physics: up-and-right, past the
    // globe, so the flare agrees with the direction the terminator implies.
    const sunTex = bakeSun();
    const sunFlare = new THREE.Sprite(new THREE.SpriteMaterial({
      map: sunTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0,
      fog: false,
    }));
    sunFlare.position.copy(new THREE.Vector3(0.55, 0.30, -1.0).normalize()).multiplyScalar(80);
    sunFlare.scale.setScalar(34);
    scene.add(sunFlare);

    /* ---------- Stars ---------- */
    // Real stellar colours (blue giants down to red dwarfs), weighted so the
    // vault reads mostly white with a scattering of tinted standouts.
    const STAR_HUES = [
      [0.63, 0.73, 1.00], // blue
      [0.79, 0.86, 1.00], // blue-white
      [1.00, 1.00, 1.00],
      [1.00, 1.00, 1.00],
      [0.97, 0.98, 1.00],
      [1.00, 0.97, 0.89], // yellow-white
      [1.00, 0.94, 0.81],
      [1.00, 0.87, 0.68], // orange
      [1.00, 0.80, 0.60],
      [1.00, 0.70, 0.54], // red
    ];
    const STAR_N = small ? 2600 : 6000;
    const spos = new Float32Array(STAR_N * 3);
    const ssize = new Float32Array(STAR_N);
    const sphase = new Float32Array(STAR_N);
    const sbright = new Float32Array(STAR_N);
    const scolor = new Float32Array(STAR_N * 3);
    // A share of the field hugs one great circle, which is what makes a real
    // night sky read as a sky: the Milky Way, not uniform confetti.
    const bandN = new THREE.Vector3(0.36, 0.88, 0.31).normalize();
    const bandU = new THREE.Vector3(0, 0, 1).cross(bandN).normalize();
    const bandV = new THREE.Vector3().crossVectors(bandN, bandU).normalize();
    const dir = new THREE.Vector3();
    for (let i = 0; i < STAR_N; i++) {
      const inBand = Math.random() < 0.42;
      if (inBand) {
        const a = Math.random() * Math.PI * 2;
        const b = gauss() * 0.11; // radians off the galactic plane
        dir.copy(bandU).multiplyScalar(Math.cos(a) * Math.cos(b))
          .addScaledVector(bandV, Math.sin(a) * Math.cos(b))
          .addScaledVector(bandN, Math.sin(b));
      } else {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        dir.set(Math.sin(ph) * Math.cos(th), Math.sin(ph) * Math.sin(th), Math.cos(ph));
      }
      const r = 60 + Math.random() * 140;
      spos[i * 3] = dir.x * r;
      spos[i * 3 + 1] = dir.y * r;
      spos[i * 3 + 2] = dir.z * r;
      // Power law: a handful of bright standouts over a dense field of pinpricks.
      // Band members stay small and dim — they are unresolved galactic dust.
      const rr = Math.random();
      ssize[i] = inBand ? 0.9 + Math.pow(rr, 6.0) * 2.6 : 1.1 + Math.pow(rr, 5.0) * 6.5;
      sbright[i] = inBand ? 0.16 + Math.pow(rr, 2.6) * 0.50 : 0.28 + Math.pow(rr, 2.2) * 0.72;
      const hue = STAR_HUES[(Math.random() * STAR_HUES.length) | 0];
      scolor[i * 3] = hue[0];
      scolor[i * 3 + 1] = hue[1];
      scolor[i * 3 + 2] = hue[2];
      sphase[i] = Math.random() * Math.PI * 2;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(spos, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(ssize, 1));
    starGeo.setAttribute('phase', new THREE.BufferAttribute(sphase, 1));
    starGeo.setAttribute('bright', new THREE.BufferAttribute(sbright, 1));
    starGeo.setAttribute('starColor', new THREE.BufferAttribute(scolor, 3));
    const starMat = new THREE.ShaderMaterial({
      vertexShader: STAR_VERT,
      fragmentShader: STAR_FRAG,
      uniforms: { time: { value: 0 }, dayMix: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ---------- Logo tunnel ---------- */
    const DEPTH = 150;
    const logoSprites = [];
    const glyphTextures = [];
    const buildLogos = () => {
      for (let i = 0; i < cfg.logoCount; i++) {
        const g = LOGOS[i % LOGOS.length];
        let tex = glyphTextures[i % LOGOS.length];
        if (!tex) { tex = bakeGlyph(g); glyphTextures[i % LOGOS.length] = tex; }
        // fog:false — aerial perspective would bleach the far end of the tunnel
        // into the daylight sky; the per-sprite fade already handles depth.
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0, fog: false });
        const sprite = new THREE.Sprite(mat);
        const s = 1.7 + Math.random() * 1.8;
        sprite.scale.set(s, s, s);
        sprite.userData = {
          bz: -Math.random() * DEPTH,
          x: (Math.random() - 0.5) * 42,
          y: (Math.random() - 0.5) * 26,
          drift: 0.15 + Math.random() * 0.35,
          spin: (Math.random() - 0.5) * 0.4,
        };
        sprite.position.set(sprite.userData.x, sprite.userData.y, sprite.userData.bz);
        scene.add(sprite);
        logoSprites.push(sprite);
      }
    };

    // Fonts must be resident before we rasterise glyphs, else we bake tofu.
    const fontReady = document.fonts
      ? Promise.all([
        document.fonts.load('400 78px "Font Awesome 6 Brands"'),
        document.fonts.load('900 78px "Font Awesome 6 Free"'),
      ]).then(() => document.fonts.ready)
      : Promise.resolve();
    let disposed = false;

    /* ---------- Drag to spin (mouse/pen only; touch keeps the page scrollable) ---------- */
    const spinTarget = { x: 0, y: 0 };
    let dragging = false;
    let last = { x: 0, y: 0 };

    const onDown = (e) => {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      // Let real controls and copyable text win; grab the globe from anywhere
      // else. [data-no-drag] opts a whole region out — the auth card uses it so
      // a stray drag across the form does not send the planet spinning.
      if (e.target.closest && e.target.closest('a,button,input,textarea,select,label,[role="button"],[data-no-drag]')) return;
      dragging = true;
      last = { x: e.clientX, y: e.clientY };
      document.body.classList.add('cosmic-grabbing');
    };
    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      spinTarget.y += dx * 0.005;
      spinTarget.x = THREE.MathUtils.clamp(spinTarget.x + dy * 0.005, -1.1, 1.1);
    };
    const onUp = () => { dragging = false; document.body.classList.remove('cosmic-grabbing'); };
    if (!isTouch) {
      window.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    }

    /* ---------- Mouse parallax ---------- */
    const parallax = { x: 0, y: 0 };
    const onParallax = (e) => {
      parallax.x = e.clientX / window.innerWidth - 0.5;
      parallax.y = e.clientY / window.innerHeight - 0.5;
    };
    if (!reduced && !isTouch) window.addEventListener('pointermove', onParallax);

    /* ---------- Scroll progress ---------- */
    let targetP = 0;
    let smoothP = 0;
    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetP = max > 0 ? THREE.MathUtils.clamp(window.scrollY / max, 0, 1) : 0;
    };
    readScroll();
    window.addEventListener('scroll', readScroll, { passive: true });

    /* ---------- Resize ---------- */
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    /* ---------- Frame ---------- */
    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true;
    const onVis = () => { visible = document.visibilityState === 'visible'; };
    document.addEventListener('visibilitychange', onVis);

    const render = () => {
      const t = clock.getElapsedTime();
      smoothP += (targetP - smoothP) * (reduced ? 1 : 0.06);
      dayMix += (dayTarget - dayMix) * (reduced ? 1 : 0.07);

      // Day/night dressing: sunlight strength, sky haze, stars, sun flare.
      scene.fog.color.lerpColors(NIGHT_FOG, DAY_FOG, dayMix);
      ambient.color.lerpColors(NIGHT_AMB, DAY_AMB, dayMix);
      // These two lights only ever reach the cloud shell — the globe itself is
      // lit analytically from `sunDir`. Push them and the shell clips to a
      // featureless white ball once scroll shrinks it.
      ambient.intensity = 1.1 + 0.30 * dayMix;
      sun.intensity = 2.2 + 0.50 * dayMix;
      earthUniforms.dayMix.value = dayMix;
      starMat.uniforms.dayMix.value = dayMix;
      stars.visible = dayMix < 0.99;
      sunFlare.material.opacity = dayMix;
      sunFlare.visible = dayMix > 0.01;
      // Thin the shell as scroll shrinks the globe: at small scale the mipped
      // coverage averages out into one flat white ball otherwise.
      cloudMat.opacity = (0.80 - 0.06 * dayMix) * (1 - 0.45 * smoothP);

      // Earth rises and recedes on scroll.
      earthPivot.position.set(
        cfg.base.x + smoothP * cfg.riseX,
        cfg.base.y + smoothP * cfg.riseY,
        cfg.base.z - smoothP * cfg.riseZ,
      );
      earthPivot.scale.setScalar(1 - smoothP * cfg.shrink);

      if (!reduced) {
        spinTarget.y += 0.0009; // gentle idle rotation
        earth.rotation.y += (spinTarget.y - earth.rotation.y) * 0.08;
        earth.rotation.x += (spinTarget.x - earth.rotation.x) * 0.08;
        clouds.rotation.y = earth.rotation.y * 1.06 + t * 0.006;
        clouds.rotation.x = earth.rotation.x;
        starMat.uniforms.time.value = t;
      } else {
        earth.rotation.y = spinTarget.y;
        earth.rotation.x = spinTarget.x;
        clouds.rotation.copy(earth.rotation);
      }

      // Endless logo tunnel keyed to scroll so it scrubs both ways, plus the
      // optional idle drift for pages that have nothing to scroll.
      const travel = smoothP * DEPTH * cfg.cycles + t * cfg.drift;
      for (const sp of logoSprites) {
        const u = sp.userData;
        const z = ((((u.bz + travel) % DEPTH) + DEPTH) % DEPTH) - DEPTH;
        sp.position.z = z;
        sp.position.x = u.x + Math.sin(t * u.drift + u.bz) * 1.4;
        sp.position.y = u.y + Math.cos(t * u.drift * 0.8 + u.bz) * 1.0;
        const fadeIn = THREE.MathUtils.smoothstep(z, -DEPTH, -DEPTH + 22);
        const fadeOut = 1 - THREE.MathUtils.smoothstep(z, -16, -2);
        sp.material.opacity = (0.92 - 0.10 * dayMix) * fadeIn * fadeOut;
        if (!reduced) sp.material.rotation += u.spin * 0.01;
      }

      // Parallax drift on the whole vault.
      const px = reduced ? 0 : parallax.x;
      const py = reduced ? 0 : parallax.y;
      camera.position.x += (px * 0.8 - camera.position.x) * 0.04;
      camera.position.y += (-py * 0.5 - camera.position.y) * 0.04;
      camera.lookAt(0, smoothP * 1.5, 0);

      renderer.render(scene, camera);
    };

    const loop = () => {
      if (visible) render();
      raf = requestAnimationFrame(loop);
    };

    // Theme changes mutate the running scene; they never rebuild it. The sibling
    // effect below fires this once on mount (child effects run before the
    // provider's), and that first call snaps rather than cross-fades.
    let themeApplied = false;
    applyThemeRef.current = (next) => {
      dayTarget = next === 'dark' ? 0 : 1;
      if (!themeApplied || reduced) {
        themeApplied = true;
        dayMix = dayTarget;
        if (reduced) render();
      }
    };

    if (reduced) {
      // No continuous loop; repaint only when the view actually changes.
      const repaint = () => { readScroll(); render(); };
      fontReady.then(() => { if (!disposed) { buildLogos(); render(); } }).catch(() => {});
      render();
      window.addEventListener('scroll', repaint, { passive: true });
      window.addEventListener('resize', repaint);
      mount._cosmicRepaint = repaint;
    } else {
      fontReady.then(() => { if (!disposed) buildLogos(); }).catch(() => { if (!disposed) buildLogos(); });
      raf = requestAnimationFrame(loop);
    }

    /* ---------- Cleanup ---------- */
    return () => {
      disposed = true;
      applyThemeRef.current = null;
      document.body.classList.remove('cosmic-grabbing');
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onParallax);
      document.removeEventListener('visibilitychange', onVis);
      if (mount._cosmicRepaint) {
        window.removeEventListener('scroll', mount._cosmicRepaint);
        window.removeEventListener('resize', mount._cosmicRepaint);
        delete mount._cosmicRepaint;
      }
      if (!isTouch) {
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      }
      scene.traverse((o) => {
        if (o.isMesh || o.isPoints || o.isSprite) {
          o.geometry?.dispose?.();
          const m = o.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose?.();
        }
      });
      Object.values(earthUniforms).forEach((u) => u.value?.isTexture && u.value.dispose());
      cloudTex.dispose();
      sunTex.dispose();
      glyphTextures.forEach((tx) => tx.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [variant]);

  useEffect(() => { applyThemeRef.current?.(theme); }, [theme]);

  // Portalled to <body> so a transformed route wrapper can't turn our
  // position:fixed backdrop into a scroll-away absolute box.
  return createPortal(
    <div ref={mountRef} className={`cosmic-scene cosmic-scene--${variant}`} aria-hidden="true" />,
    document.body,
  );
};

export default CosmicScene;
