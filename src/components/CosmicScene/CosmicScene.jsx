import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';
import './CosmicScene.css';

const TEX = '/textures/earth/';
const MOON_TEX = '/textures/moon/';

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
  uniform float dayMix;
  uniform float amt;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;

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
    float dayAmt = mix(term, mix(term, 1.0, 0.88), dayMix);

    float ocean = texture2D(specMap, vUv).r;
    vec3 day = texture2D(dayMap, vUv).rgb;
    day += vec3(0.03, 0.09, 0.20) * ocean * (0.35 + 0.65 * dayMix);

    vec3 night = texture2D(nightMap, vUv).rgb;
    vec3 nightGlow = night * 1.7 * smoothstep(0.08, -0.28, ndl) * (1.0 - dayMix * 0.7);
    vec3 lit = mix(
      day * (0.46 + 1.35 * max(ndl, 0.0)),
      day * (1.00 + 1.00 * max(ndl, 0.0)),
      dayMix
    );
    vec3 surface = mix(nightGlow, lit, dayAmt);

    vec3 R = reflect(-sunDir, N);
    float spec = pow(max(dot(R, V), 0.0), 260.0) * ocean * term;
    surface += vec3(1.0, 0.92, 0.70) * spec * (0.55 + 0.35 * dayMix);

    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.5);
    vec3 atmosphereColor = mix(vec3(0.2, 0.5, 1.0), vec3(0.5, 0.75, 1.0), dayMix);
    surface += atmosphereColor * fresnel * 0.45 * (0.4 + 0.6 * dayAmt);

    gl_FragColor = vec4(surface * amt, 1.0);
  }
`;

const MOON_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vT;
  varying vec3 vB;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    mat3 nm = mat3(modelMatrix);
    vec3 n = normalize(nm * normal);
    vec3 t = normalize(cross(vec3(0.0, 1.0, 0.0), n) + vec3(1e-5, 0.0, 0.0));
    vN = n;
    vT = t;
    vB = normalize(cross(n, t));
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const MOON_FRAG = /* glsl */ `
  uniform sampler2D colorMap;
  uniform sampler2D heightMap;
  uniform vec3 sunDir;
  uniform vec2 texel;
  uniform float bumpScale;
  uniform float dayMix;
  uniform float amt;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vT;
  varying vec3 vB;
  varying vec3 vView;

  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vView);

    float hL = texture2D(heightMap, vUv - vec2(texel.x, 0.0)).r;
    float hR = texture2D(heightMap, vUv + vec2(texel.x, 0.0)).r;
    float hD = texture2D(heightMap, vUv - vec2(0.0, texel.y)).r;
    float hU = texture2D(heightMap, vUv + vec2(0.0, texel.y)).r;
    float dhdu = (hR - hL) * 0.5;
    float dhdv = (hU - hD) * 0.5;
    vec3 Np = normalize(N - (vT * dhdu + vB * dhdv) * bumpScale);

    float NdL = dot(Np, sunDir);
    float NdV = max(dot(Np, V), 0.0);
    float lam = max(NdL, 0.0);

    float ls = lam / max(lam + NdV, 1e-3);
    float lit = mix(lam, ls * 1.85, 0.74);
    lit *= smoothstep(-0.03, 0.05, dot(N, sunDir));

    vec3 albedo = texture2D(colorMap, vUv).rgb;
    albedo = pow(albedo, vec3(0.85)) * 1.15;

    vec3 col = albedo * lit * (2.2 + 0.8 * dayMix);
    col += albedo * vec3(0.08, 0.12, 0.22) * smoothstep(0.10, -0.45, NdL) * (1.0 - dayMix * 0.5);

    gl_FragColor = vec4(col * amt, 1.0);
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
    float tw = 0.80 + 0.20 * sin(time * 1.2 + phase);
    vColor = starColor;
    vAlpha = bright * tw * (1.0 - dayMix * 0.85);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (260.0 / -mv.z);
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
    float core = smoothstep(0.5, 0.08, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.25;
    gl_FragColor = vec4(vColor, (core * core + halo) * vAlpha);
  }
`;

const CosmicScene = ({ variant = 'home' }) => {
  const mountRef = useRef(null);
  const themeApi = useTheme();
  const theme = themeApi?.theme === 'dark' ? 'dark' : 'light';
  const applyThemeRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const small = window.innerWidth < 720;

    const isMoon = variant === 'contact';

    const CFG = {
      about: {
        base: new THREE.Vector3(2.0, 0.2, -0.6),
        radius: 2.5,
        shrink: 0.15,
        driftY: 0.5,
      },
      auth: small
        ? {
            base: new THREE.Vector3(-0.5, 2.4, -1.4),
            radius: 2.2,
            shrink: 0.1,
            driftY: 0.3,
          }
        : {
            base: new THREE.Vector3(-2.8, -0.8, -0.6),
            radius: 2.8,
            shrink: 0.12,
            driftY: 0.4,
          },
      contact: small
        ? {
            base: new THREE.Vector3(0, 2.2, -1.2),
            radius: 2.1,
            shrink: 0.12,
            driftY: 0.4,
          }
        : {
            base: new THREE.Vector3(2.2, -0.2, -0.5),
            radius: 2.7,
            shrink: 0.15,
            driftY: 0.6,
          },
      home: {
        base: new THREE.Vector3(2.0, -0.8, 0),
        radius: 3.4,
        shrink: 0.35,
        driftY: 1.8,
      },
    };
    const cfg = CFG[variant] || CFG.home;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !small,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      mount.classList.add('cosmic--failed');
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    mount.classList.add('cosmic--driven');

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070f, 0.006);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
    camera.position.set(0, 0, 9);

    const sunDir = new THREE.Vector3(0.82, 0.22, 0.28).normalize();
    const ambient = new THREE.AmbientLight(0x223044, 1.2);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff2dd, 2.2);
    sun.position.copy(sunDir).multiplyScalar(10);
    scene.add(sun);

    const NIGHT_FOG = new THREE.Color(0x05070f);
    const DAY_FOG = new THREE.Color(0xdcebfc);
    const NIGHT_AMB = new THREE.Color(0x1a2638);
    const DAY_AMB = new THREE.Color(0xc3d8f2);
    let dayTarget = 0;
    let dayMix = 0;
    let lastSky = -1;

    /* ---------- 3D Body (Earth or Moon) ---------- */
    const bodyPivot = new THREE.Group();
    bodyPivot.position.copy(cfg.base);
    scene.add(bodyPivot);

    const bodySpin = new THREE.Group();
    bodySpin.rotation.z = THREE.MathUtils.degToRad(isMoon ? 6.7 : 23.4);
    bodyPivot.add(bodySpin);

    const texManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(texManager);
    const srgb = (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      return t;
    };
    const lin = (t) => {
      t.colorSpace = THREE.NoColorSpace;
      return t;
    };

    let bodyMesh;
    let cloudMat;
    let clouds;
    let uniforms;

    if (isMoon) {
      const moonColor = srgb(loader.load(MOON_TEX + 'moon_color_2048.jpg'));
      const moonHeight = lin(loader.load(MOON_TEX + 'moon_height_2048.jpg'));

      uniforms = {
        colorMap: { value: moonColor },
        heightMap: { value: moonHeight },
        sunDir: { value: new THREE.Vector3(0.6, 0.24, 0.76).normalize() },
        texel: { value: new THREE.Vector2(1 / 2048, 1 / 1024) },
        bumpScale: { value: 36 },
        dayMix: { value: 0 },
        amt: { value: 1 },
      };

      bodyMesh = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.radius, 96, 96),
        new THREE.ShaderMaterial({
          vertexShader: MOON_VERT,
          fragmentShader: MOON_FRAG,
          uniforms,
        }),
      );
      bodySpin.add(bodyMesh);
    } else {
      uniforms = {
        dayMap: { value: srgb(loader.load(TEX + 'earth_day_4096.jpg')) },
        nightMap: { value: srgb(loader.load(TEX + 'earth_night_2048.jpg')) },
        specMap: { value: lin(loader.load(TEX + 'earth_specular_2048.jpg')) },
        normalMap: { value: lin(loader.load(TEX + 'earth_normal_2048.jpg')) },
        sunDir: { value: sunDir },
        normalStrength: { value: 0.25 },
        dayMix: { value: 0 },
        amt: { value: 1 },
      };

      bodyMesh = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.radius, 96, 96),
        new THREE.ShaderMaterial({
          vertexShader: EARTH_VERT,
          fragmentShader: EARTH_FRAG,
          uniforms,
        }),
      );
      bodySpin.add(bodyMesh);

      // Cloud shell (Earth only)
      const cloudTex = lin(loader.load(TEX + 'earth_clouds_2048.jpg'));
      cloudTex.anisotropy = 4;
      cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        alphaMap: cloudTex,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        roughness: 0.9,
        metalness: 0,
      });
      clouds = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.radius * 1.012, 64, 64),
        cloudMat,
      );
      bodySpin.add(clouds);
    }

    /* ---------- Subtle LMS Ambient Star / Particle Backdrop ---------- */
    const STAR_HUES = [
      [0.70, 0.82, 1.00],
      [0.85, 0.90, 1.00],
      [1.00, 1.00, 1.00],
      [1.00, 0.96, 0.88],
      [0.65, 0.80, 1.00],
    ];
    const STAR_N = small ? 1200 : 2500;
    const spos = new Float32Array(STAR_N * 3);
    const ssize = new Float32Array(STAR_N);
    const sphase = new Float32Array(STAR_N);
    const sbright = new Float32Array(STAR_N);
    const scolor = new Float32Array(STAR_N * 3);

    for (let i = 0; i < STAR_N; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r = 50 + Math.random() * 120;
      spos[i * 3] = Math.sin(ph) * Math.cos(th) * r;
      spos[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * r;
      spos[i * 3 + 2] = Math.cos(ph) * r;

      const rr = Math.random();
      ssize[i] = 1.0 + Math.pow(rr, 4.0) * 4.5;
      sbright[i] = 0.20 + Math.pow(rr, 2.0) * 0.55;
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

    /* ---------- Drag to spin ---------- */
    const spinTarget = { x: 0, y: 0 };
    let dragging = false;
    let last = { x: 0, y: 0 };

    const onDown = (e) => {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      if (
        e.target.closest &&
        e.target.closest(
          'a,button,input,textarea,select,label,[role="button"],[data-no-drag]',
        )
      )
        return;
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
    const onUp = () => {
      dragging = false;
      document.body.classList.remove('cosmic-grabbing');
    };
    if (!isTouch) {
      window.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    }

    /* ---------- Mouse Parallax ---------- */
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

    /* ---------- Render Loop ---------- */
    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true;
    const onVis = () => {
      visible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', onVis);

    const render = () => {
      const t = clock.getElapsedTime();
      smoothP += (targetP - smoothP) * (reduced ? 1 : 0.06);
      dayMix += (dayTarget - dayMix) * (reduced ? 1 : 0.07);

      if (Math.abs(dayMix - lastSky) > 0.004) {
        lastSky = dayMix;
        mount.style.setProperty('--cosmic-day', dayMix.toFixed(3));
      }

      scene.fog.color.lerpColors(NIGHT_FOG, DAY_FOG, dayMix);
      ambient.color.lerpColors(NIGHT_AMB, DAY_AMB, dayMix);
      ambient.intensity = 1.2 + 0.3 * dayMix;
      sun.intensity = 2.2 + 0.4 * dayMix;

      uniforms.dayMix.value = dayMix;
      starMat.uniforms.dayMix.value = dayMix;

      bodyPivot.position.set(
        cfg.base.x,
        cfg.base.y + smoothP * cfg.driftY,
        cfg.base.z - smoothP * 0.5,
      );
      bodyPivot.scale.setScalar(1 - smoothP * cfg.shrink);

      if (!reduced) {
        spinTarget.y += isMoon ? 0.0004 : 0.001; // Moon rotates slower
        bodyMesh.rotation.y += (spinTarget.y - bodyMesh.rotation.y) * 0.08;
        bodyMesh.rotation.x += (spinTarget.x - bodyMesh.rotation.x) * 0.08;
        if (clouds) {
          clouds.rotation.y = bodyMesh.rotation.y * 1.05 + t * 0.005;
          clouds.rotation.x = bodyMesh.rotation.x;
        }
        starMat.uniforms.time.value = t;
      } else {
        bodyMesh.rotation.y = spinTarget.y;
        bodyMesh.rotation.x = spinTarget.x;
        if (clouds) clouds.rotation.copy(bodyMesh.rotation);
      }

      const px = reduced ? 0 : parallax.x;
      const py = reduced ? 0 : parallax.y;
      camera.position.x += (px * 0.6 - camera.position.x) * 0.04;
      camera.position.y += (-py * 0.4 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    const loop = () => {
      if (visible) render();
      raf = requestAnimationFrame(loop);
    };

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
      const repaint = () => {
        readScroll();
        render();
      };
      texManager.onLoad = render;
      render();
      window.addEventListener('scroll', repaint, { passive: true });
      window.addEventListener('resize', repaint);
      mount._cosmicRepaint = repaint;
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      texManager.onLoad = undefined;
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
        if (o.isMesh || o.isPoints) {
          o.geometry?.dispose?.();
          const m = o.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose?.();
        }
      });
      Object.values(uniforms).forEach((u) => u.value?.isTexture && u.value.dispose());
      cloudMat?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [variant]);

  useEffect(() => {
    applyThemeRef.current?.(theme);
  }, [theme]);

  return createPortal(
    <div
      ref={mountRef}
      className={`cosmic-scene cosmic-scene--${variant}`}
      aria-hidden="true"
    />,
    document.body,
  );
};

export default CosmicScene;
