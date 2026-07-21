/* Deep-space bodies for the home-page scroll journey: Moon, Sun, galaxy.
 *
 * Every builder returns { object, update(t, amt, lp, camera), dispose() } where
 *   amt = 0..1 stage presence (0 means "not on stage")
 *   lp  = 0..1 progress across that body's own window, used to fly it past.
 *
 * Nothing here uses alpha blending against the sky for the solid bodies. They
 * fade by multiplying their colour toward black, which is what the sky already
 * is once the journey has left Earth behind. That keeps every body opaque and
 * depth-correct, so no transparency sorting can put the far side of a sphere in
 * front of the near. Only the glow quads blend, and they add rather than cover.
 */
import * as THREE from 'three';

// Box-Muller. Shared with the star field in CosmicScene.
export const gauss = () =>
  Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

const CAM_Z = 9; // where CosmicScene parks the camera

/* Fly-past. Distance is the handle that matters, because apparent radius in
   pixels is (radius / distance) * (viewportHeight / 2) / tan(fov / 2) — so
   driving distance directly is the only way to promise a body actually fills
   the frame at its peak. It slides through three framing keys, and closes from
   `far` to `near`: with `recede` it peaks at mid-window and backs off again,
   without it it just keeps coming, which is what a body that ends the journey
   needs. Key z is ignored — distance owns it. */
const flyPath = (out, e, [A, P, B], far, near, recede = true) => {
  const half = e < 0.5 ? e * 2 : (e - 0.5) * 2;
  const s = half * half * (3 - 2 * half);
  if (e < 0.5) out.lerpVectors(A, P, s);
  else out.lerpVectors(P, B, s);
  // Non-recede closes fast and then eases, so a body that ends the journey is
  // already big through the whole final stretch instead of only at the footer.
  const k = recede ? Math.sin(Math.PI * e) : Math.pow(e, 0.62);
  out.z = CAM_Z - (far - (far - near) * k);
  return out;
};

/* Additive blending in three.js is (SrcAlpha, One) on the ALPHA channel too, so
   a quad that writes alpha 1.0 turns the whole canvas opaque over its footprint
   — and with a transparent renderer that means its dark pixels punch a black
   hole in the CSS sky. These glows add straight into colour and let alpha track
   brightness instead, so dark parts of the quad stay see-through. */
const GLOW_BLEND = {
  transparent: true,
  depthWrite: false,
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneFactor,
  blendEquationAlpha: THREE.AddEquation,
  blendSrcAlpha: THREE.OneFactor,
  blendDstAlpha: THREE.OneFactor,
};

/* Value noise + Worley cells, injected into the shaders that need them.
   Worley is what makes the Sun read as convection cells rather than clouds:
   granules are bright centres separated by dark downflow lanes. */
const NOISE_GLSL = /* glsl */ `
  vec3 hash33(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return fract(sin(p) * 43758.5453123);
  }
  float hash13(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float vnoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash13(i + vec3(0.0, 0.0, 0.0)), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
                   mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
               mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
                   mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float a = 0.5;
    float s = 0.0;
    for (int i = 0; i < 4; i++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; }
    return s;
  }
  float worley(vec3 p) {
    vec3 ip = floor(p);
    vec3 fp = fract(p);
    float d = 1e9;
    for (int x = -1; x <= 1; x++)
    for (int y = -1; y <= 1; y++)
    for (int z = -1; z <= 1; z++) {
      vec3 g = vec3(float(x), float(y), float(z));
      vec3 o = hash33(ip + g);
      vec3 r = g + o - fp;
      d = min(d, dot(r, r));
    }
    return sqrt(d);
  }
`;

// Every glow quad shares this: a plain pass-through, since the quad is turned
// to face the camera on the CPU rather than billboarded in the shader.
const QUAD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* ══════════════════════ Moon ══════════════════════ */

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
    // Exact tangent frame for a UV sphere: u wraps about +Y, so east is
    // cross(Y, N). Cheaper and far steadier than screen-space derivatives,
    // which crawl badly on a body this close to the camera.
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
  uniform float detailScale;
  uniform float amt;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vT;
  varying vec3 vB;
  varying vec3 vView;

  ${NOISE_GLSL}

  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vView);

    // Slope straight off the LDEM plate: four taps, central difference.
    float hL = texture2D(heightMap, vUv - vec2(texel.x, 0.0)).r;
    float hR = texture2D(heightMap, vUv + vec2(texel.x, 0.0)).r;
    float hD = texture2D(heightMap, vUv - vec2(0.0, texel.y)).r;
    float hU = texture2D(heightMap, vUv + vec2(0.0, texel.y)).r;
    float dhdu = (hR - hL) * 0.5;
    float dhdv = (hU - hD) * 0.5;
    vec3 Np = normalize(N - (vT * dhdu + vB * dhdv) * bumpScale);

    // The 2K plate goes soft once the Moon fills a third of the screen, so a
    // little procedural regolith rides on top of the real relief. Kept faint:
    // any more and it reads as sensor grain rather than ground.
    vec3 dp = N * 220.0;
    float g1 = vnoise(dp) - 0.5;
    float g2 = vnoise(dp * 2.7) - 0.5;
    Np = normalize(Np + (vT * (g1 + g2 * 0.5) + vB * (g2 - g1 * 0.5)) * detailScale);

    float NdL = dot(Np, sunDir);
    float NdV = max(dot(Np, V), 0.0);
    float lam = max(NdL, 0.0);

    // Regolith is retroreflective: it scatters light back the way it came, which
    // is why a full Moon looks like a flat disc instead of a shaded ball.
    // Lommel-Seeliger reproduces that; pure Lambert is the classic fake tell.
    float ls = lam / max(lam + NdV, 1e-3);
    float lit = mix(lam, ls * 1.85, 0.74);

    // Opposition surge: near zero phase angle the shadows cast by every grain
    // hide behind the grains themselves and the surface flares. It is why a full
    // Moon is far brighter than twice a half Moon.
    float phase = dot(sunDir, V);
    lit *= 1.0 + 0.30 * pow(max(phase, 0.0), 6.0);

    // Airless body: the terminator is a knife edge, not a gradient.
    lit *= smoothstep(-0.03, 0.05, dot(N, sunDir));

    // The LRO plate is shot flat so it can be relit. Pulling a little contrast
    // back separates the basalt maria from the highlands instead of leaving one
    // even grey; without it the whole disc reads as a dirty smudge.
    vec3 albedo = texture2D(colorMap, vUv).rgb;
    albedo = pow(albedo, vec3(0.82)) * 1.12;

    vec3 col = albedo * lit * 2.55;

    // Earthshine. Faint, blue, and only on the night side.
    col += albedo * vec3(0.070, 0.092, 0.150) * smoothstep(0.10, -0.45, NdL);

    gl_FragColor = vec4(col * amt, 1.0);
  }
`;

export const createMoon = ({ loader, texPath, small }) => {
  const color = loader.load(`${texPath}moon_color_2048.jpg`);
  color.colorSpace = THREE.SRGBColorSpace;
  color.anisotropy = 4;
  const height = loader.load(`${texPath}moon_height_2048.jpg`);
  height.colorSpace = THREE.NoColorSpace;

  const uniforms = {
    colorMap: { value: color },
    heightMap: { value: height },
    // Well round toward the camera, so the disc reads as a bright waxing gibbous
    // rather than a half-lit ball with a black wedge bitten out of it.
    sunDir: { value: new THREE.Vector3(0.60, 0.24, 0.76).normalize() },
    texel: { value: new THREE.Vector2(1 / 2048, 1 / 1024) },
    bumpScale: { value: 44 },
    detailScale: { value: 0.035 },
    amt: { value: 0 },
  };

  const mat = new THREE.ShaderMaterial({
    vertexShader: MOON_VERT,
    fragmentShader: MOON_FRAG,
    uniforms,
    fog: false,
  });
  const R = 3.6;
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(R, small ? 64 : 128, small ? 32 : 64), mat);
  const group = new THREE.Group();
  group.add(mesh);
  group.visible = false;

  // Sweeps in from upper left, passes close down the left third, exits low
  // right. Held left of centre so the lit limb sits in the page gutter rather
  // than being diced up by the card grid.
  const KX = small ? 0.42 : 1;
  const KEYS = [
    new THREE.Vector3(-8.4 * KX, 6.0, 0),
    new THREE.Vector3(-4.4 * KX, 0.6, 0),
    new THREE.Vector3(7.0 * KX, -5.0, 0),
  ];
  const FAR = 95;
  const NEAR = small ? 26 : 18; // ~520px across on a 1000px-tall desktop viewport

  return {
    object: group,
    update(t, amt, lp) {
      group.visible = amt > 0.004;
      if (!group.visible) return;
      uniforms.amt.value = amt;
      flyPath(group.position, lp, KEYS, FAR, NEAR);
      // Tidally locked, so the near side barely turns. A hair of libration only.
      mesh.rotation.y = 2.35 + Math.sin(t * 0.05) * 0.04 + lp * 0.30;
      mesh.rotation.x = Math.sin(t * 0.04) * 0.03;
    },
    dispose() {
      mesh.geometry.dispose();
      mat.dispose();
      color.dispose();
      height.dispose();
    },
  };
};

/* ══════════════════════ Sun ══════════════════════ */

const SUN_VERT = /* glsl */ `
  varying vec3 vObj;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vObj = normalize(position);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - wp.xyz);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

/* The photosphere is a 5772 K black body: in white light it is *white*, faintly
   gold at the rim. Weighting the palette orange is what turns a star into a
   basketball, so the warm tones here only ever surface in the cool downflow
   lanes between granules and in the last few degrees before the limb. The
   output deliberately runs past 1.0 so the middle of the disc clips out to pure
   white — a star you could look at comfortably does not read as a star. */
const SUN_FRAG = /* glsl */ `
  uniform float time;
  uniform float amt;
  varying vec3 vObj;
  varying vec3 vN;
  varying vec3 vView;

  ${NOISE_GLSL}

  void main() {
    vec3 d = normalize(vObj);

    // Granulation: convection cells, dragged around by a slow turbulent warp so
    // the pattern boils rather than sliding rigidly.
    float warp = fbm(d * 3.6 + vec3(0.0, 0.0, time * 0.035));
    vec3 cellP = d * 68.0 + warp * 3.0 + vec3(time * 0.05, time * 0.03, time * 0.04);
    float cell = worley(cellP);
    float gran = smoothstep(0.70, 0.16, cell);
    // One Worley octave alone still reads as orange peel at this size; a fine
    // noise pass breaks the cells up the way real granules never tile evenly.
    gran = gran * 0.80 + fbm(d * 160.0) * 0.32;

    // Supergranulation: the much larger mottling underneath.
    float superg = fbm(d * 3.0 + vec3(time * 0.018, 0.0, 0.0));

    // Weighted toward the large scale on purpose. Leading with the cells makes
    // the disc look like it has a rough skin instead of a luminous surface.
    float heat = 0.42 * gran + 0.58 * superg;

    // Sunspots. Rare and shallow — at this scale a big dark blotch just reads
    // as a smudge on the lens.
    float sp = fbm(d * 2.4 + 31.7);
    float pen = smoothstep(0.600, 0.655, sp);
    float umb = smoothstep(0.655, 0.700, sp);
    heat = mix(heat, heat * 0.55, pen);
    heat = mix(heat, heat * 0.24, umb);

    // Limb darkening: light from the rim escapes from a shallower, cooler layer.
    // Mild, because a hard falloff is what makes it read as a shaded ball.
    float mu = clamp(dot(normalize(vN), normalize(vView)), 0.0, 1.0);
    float limb = 1.0 - 0.38 * (1.0 - mu);

    vec3 lane = vec3(1.00, 0.50, 0.16);
    vec3 warm = vec3(1.00, 0.76, 0.34);
    vec3 hot  = vec3(1.00, 0.99, 0.96);
    vec3 col = mix(warm, hot, smoothstep(0.16, 0.62, heat));
    col = mix(lane, col, smoothstep(0.00, 0.20, heat));
    col *= limb;
    // The rim reddens as well as dims, but only in the last stretch.
    col = mix(col, col * vec3(1.0, 0.78, 0.52), pow(1.0 - mu, 2.0) * 0.72);

    gl_FragColor = vec4(col * 2.15 * amt, 1.0);
  }
`;

/* Everything that makes the Sun read as a light source rather than an object:
   stacked bloom, eight-point diffraction spikes, a needle ring at the limb, and
   the streaming corona. One quad, because each extra full-screen pass costs a
   full-screen shade. */
const STAR_FRAG = /* glsl */ `
  uniform float time;
  uniform float amt;
  uniform float disc; // photosphere radius as a fraction of the quad half-width
  varying vec2 vUv;

  ${NOISE_GLSL}

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    if (r > 1.0) discard;
    float ang = atan(p.y, p.x);

    // Distance out from the limb. Zero across the whole disc, so the bloom
    // saturates the edge instead of forming a ring around it.
    float d = max(r - disc, 0.0);

    // Three stacked falloffs. The tight one blows the limb out to white, the
    // wide one is the soft halo the eye expects around anything this bright.
    // All three fall off hard on purpose: a gentle wide term reaches the quad's
    // edge with enough amplitude left to lay a dim tan disc over half the page,
    // which reads as grime on the lens rather than as light.
    float tight = exp(-d * 26.0);
    float mid   = exp(-d * 11.0);
    float wide  = exp(-d * 5.0);

    // Hold the bloom back over the middle of the disc so the granulation
    // underneath still shows. Full strength from the limb outward.
    float keep = 1.0 - 0.74 * smoothstep(disc, disc * 0.50, r);
    tight *= keep;
    mid *= keep;
    wide *= keep;

    // Diffraction spikes. Two four-point sets 45 degrees apart give the
    // eight-point star an aperture actually produces, and they breathe out of
    // phase so the spikes shimmer instead of sitting there like a decal.
    float f1 = 0.80 + 0.20 * sin(time * 0.62);
    float f2 = 0.72 + 0.28 * sin(time * 0.94 + 2.1);
    // These reach much further than the bloom does, and that is the point: a
    // spike is a few pixels wide, so it can cross half the screen without
    // fogging anything underneath it.
    float s1 = pow(abs(cos(ang)), 130.0) + pow(abs(sin(ang)), 130.0);
    float s2 = pow(abs(cos(ang + 0.7854)), 200.0) + pow(abs(sin(ang + 0.7854)), 200.0);
    float spike = (s1 * f1 * 0.62 + s2 * f2 * 0.30) * exp(-d * 2.6);

    // Needle ring: the fine sparkle right off the limb.
    float ray = pow(abs(sin(ang * 24.0 + time * 0.06)), 7.0) * exp(-d * 13.0) * 0.42;

    // Corona streamers: noise sampled on a ring so it wraps seamlessly in angle,
    // then stretched radially into the plumes coronagraph images show. Keyed off
    // distance from the limb, not off the quad, so the plumes stay a collar on
    // the star instead of spreading to fill the whole billboard.
    float s = fbm(vec3(cos(ang) * 2.6, sin(ang) * 2.6, r * 0.9 + time * 0.03));
    float streak = exp(-d * 7.0) * (0.25 + 1.05 * s)
                 * smoothstep(disc * 0.98, disc * 1.12, r);

    vec3 col = vec3(1.00, 0.99, 0.96) * tight * 1.55
             + vec3(1.00, 0.90, 0.66) * mid * 0.80
             + vec3(1.00, 0.72, 0.42) * wide * 0.30
             + vec3(1.00, 0.96, 0.86) * (spike + ray)
             + vec3(1.00, 0.78, 0.48) * streak * 0.80;
    col *= amt;
    gl_FragColor = vec4(col, clamp(max(max(col.r, col.g), col.b), 0.0, 1.0));
  }
`;

export const createSun = ({ small }) => {
  // Smaller disc than the Moon gets, deliberately. Brilliance sells a star;
  // sheer size just makes a coloured wall behind the copy.
  const R = 3.2;
  const group = new THREE.Group();
  group.visible = false;

  const sunUniforms = { time: { value: 0 }, amt: { value: 0 } };
  const sunMat = new THREE.ShaderMaterial({
    vertexShader: SUN_VERT,
    fragmentShader: SUN_FRAG,
    uniforms: sunUniforms,
    fog: false,
  });
  const photosphere = new THREE.Mesh(new THREE.SphereGeometry(R, small ? 48 : 96, small ? 24 : 48), sunMat);
  group.add(photosphere);

  // The light rides on a camera-facing quad drawn after the disc, so the bloom
  // washes over the limb the way real glare does.
  const HALF = R * 6.5;
  const starUniforms = { time: { value: 0 }, amt: { value: 0 }, disc: { value: R / HALF } };
  const starMat = new THREE.ShaderMaterial({
    vertexShader: QUAD_VERT,
    fragmentShader: STAR_FRAG,
    uniforms: starUniforms,
    fog: false,
    ...GLOW_BLEND,
  });
  const star = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, HALF * 2), starMat);
  group.add(star);

  // Arrives high left, holds high on the right where the page gutter is, exits
  // low left. Kept off the middle so the spikes frame the copy instead of
  // burning through it. A phone has no gutter to aim at, so the whole path
  // narrows toward the centre line rather than leaving the star half offscreen.
  const KX = small ? 0.42 : 1;
  const KEYS = [
    new THREE.Vector3(-4.5 * KX, 5.0, 0),
    new THREE.Vector3(4.0 * KX, 3.2, 0),
    new THREE.Vector3(-6.5 * KX, -4.5, 0),
  ];
  const FAR = 300;
  const NEAR = small ? 32 : 26; // ~320px disc, spikes reaching several times that

  return {
    object: group,
    update(t, amt, lp, camera) {
      group.visible = amt > 0.004;
      if (!group.visible) return;
      sunUniforms.amt.value = amt;
      sunUniforms.time.value = t;
      starUniforms.amt.value = amt;
      starUniforms.time.value = t;
      flyPath(group.position, lp, KEYS, FAR, NEAR);
      photosphere.rotation.y = t * 0.012;
      star.quaternion.copy(camera.quaternion);
    },
    dispose() {
      photosphere.geometry.dispose();
      sunMat.dispose();
      star.geometry.dispose();
      starMat.dispose();
    },
  };
};

/* ══════════════════════ Galaxy ══════════════════════ */

const GAL_VERT = /* glsl */ `
  attribute float size;
  attribute float bright;
  attribute vec3 gColor;
  uniform float amt;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = gColor;
    vAlpha = bright * amt;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = max(size * (320.0 / -mv.z), 0.6);
    gl_Position = projectionMatrix * mv;
  }
`;

const GAL_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.05, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.35;
    // Overdriven: the disc has to survive being read through the semi-opaque
    // content cards that sit over it for most of the final section.
    gl_FragColor = vec4(vColor * 2.4, (core * core + halo) * vAlpha);
  }
`;

/* Unresolved starlight from the bulge. Tight on purpose — the wide, strong
   version of this quad swallowed the inner arms and left a featureless white
   blob where the most interesting structure in the galaxy is. */
const CORE_FRAG = /* glsl */ `
  uniform float amt;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    if (r > 1.0) discard;
    float g = pow(max(1.0 - r, 0.0), 4.0) * 0.55 + pow(max(1.0 - r, 0.0), 11.0) * 1.30;
    vec3 col = mix(vec3(1.00, 0.78, 0.48), vec3(1.00, 0.95, 0.86), pow(max(1.0 - r, 0.0), 7.0)) * g * amt;
    gl_FragColor = vec4(col, clamp(max(max(col.r, col.g), col.b), 0.0, 1.0));
  }
`;

/* The milky wash between the resolved stars. Lies in the disc plane so it
   foreshortens with the tilt, which is most of what stops the point cloud from
   reading as loose confetti. */
const DISC_FRAG = /* glsl */ `
  uniform float amt;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    if (r > 1.0) discard;
    // Exponential, same scale length as the star field, with the rim feathered
    // so the quad's own edge never shows as a circle.
    float g = exp(-r * 4.6) * smoothstep(1.0, 0.70, r);
    vec3 col = mix(vec3(0.58, 0.70, 1.00), vec3(1.00, 0.88, 0.70), exp(-r * 4.0)) * g * amt * 0.60;
    gl_FragColor = vec4(col, clamp(max(max(col.r, col.g), col.b), 0.0, 1.0));
  }
`;

export const createGalaxy = ({ small }) => {
  const N = small ? 30000 : 110000;
  const ARMS = 2;
  const PITCH = 0.30;       // tan of the arm pitch angle -> how tightly it winds
  const R_MAX = 46;
  const R_CORE = 5.2;

  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const siz = new Float32Array(N);
  const bri = new Float32Array(N);

  // Palette: hot blue-white newborns in the arms, an old yellow-red bulge, and
  // the pink HII knots that mark active star formation.
  const ARM_HUES = [
    [0.66, 0.80, 1.00],
    [0.82, 0.90, 1.00],
    [1.00, 1.00, 1.00],
    [0.94, 0.96, 1.00],
  ];
  const OLD_HUES = [
    [1.00, 0.86, 0.62],
    [1.00, 0.78, 0.52],
    [1.00, 0.91, 0.74],
  ];

  for (let i = 0; i < N; i++) {
    const roll = Math.random();
    let x, y, z, r;
    let hue;
    let b;
    let s;

    if (roll < 0.17) {
      /* Bulge: a flattened triaxial blob of old stars. */
      const rr = Math.pow(Math.random(), 2.1) * R_CORE;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      x = rr * Math.sin(ph) * Math.cos(th);
      z = rr * Math.sin(ph) * Math.sin(th);
      y = rr * Math.cos(ph) * 0.62;
      hue = OLD_HUES[(Math.random() * OLD_HUES.length) | 0];
      b = 0.45 + Math.pow(Math.random(), 1.8) * 0.75;
      s = 1.2 + Math.pow(Math.random(), 4.5) * 2.8;
    } else if (roll < 0.965) {
      /* Disc: exponential falloff, stars pulled onto logarithmic spiral arms. */
      r = -8.6 * Math.log(1 - Math.random() * 0.986);
      r = Math.min(r + 2.2, R_MAX);
      const arm = (Math.random() * ARMS) | 0;
      const base = Math.log(r / 1.6) / PITCH + (arm * Math.PI * 2) / ARMS;
      // Scatter perpendicular to the arm. Wider further out, which is what makes
      // arms crisp near the bulge and frayed at the rim. Tight: the previous
      // spread ran to most of a radian at the edge, which smeared both arms into
      // one even disc and threw away the whole point of a spiral.
      const spread = 0.16 + 0.30 * (r / R_MAX);
      const off = gauss() * spread;
      const th = base + off;
      x = Math.cos(th) * r;
      z = Math.sin(th) * r;
      y = gauss() * (0.55 + 1.5 * Math.exp(-r / 9));

      const inArm = Math.abs(off) < spread * 1.15;
      if (inArm && Math.random() < 0.055) {
        hue = [1.00, 0.58, 0.72];               // HII region
        b = 0.85 + Math.random() * 0.25;
        s = 2.6 + Math.random() * 3.8;
      } else if (inArm) {
        hue = ARM_HUES[(Math.random() * ARM_HUES.length) | 0];
        b = 0.32 + Math.pow(Math.random(), 2.2) * 0.82;
        s = 1.0 + Math.pow(Math.random(), 4.2) * 2.8;
      } else {
        hue = OLD_HUES[(Math.random() * OLD_HUES.length) | 0];
        b = 0.10 + Math.pow(Math.random(), 3.2) * 0.30;
        s = 0.8 + Math.pow(Math.random(), 5.0) * 1.6;
      }

      // Dust lane: a dark band hugging the inner edge of each arm. Measured in
      // units of the local spread so it tracks the arm instead of drifting off
      // it as the scatter widens outward. Modelled as extinction rather than by
      // removing stars, so the lane still glows faintly.
      const dust = Math.exp(-Math.pow((off / spread + 1.15) / 0.55, 2));
      b *= 1 - 0.82 * dust;
    } else {
      /* Halo: sparse, old, and roughly spherical. */
      const rr = R_CORE + Math.pow(Math.random(), 0.7) * R_MAX * 1.15;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      x = rr * Math.sin(ph) * Math.cos(th);
      z = rr * Math.sin(ph) * Math.sin(th);
      y = rr * Math.cos(ph) * 0.75;
      hue = OLD_HUES[(Math.random() * OLD_HUES.length) | 0];
      b = 0.05 + Math.random() * 0.16;
      s = 0.7 + Math.random() * 1.1;
    }

    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    col[i * 3] = hue[0];
    col[i * 3 + 1] = hue[1];
    col[i * 3 + 2] = hue[2];
    bri[i] = b;
    siz[i] = s;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('gColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('bright', new THREE.BufferAttribute(bri, 1));
  geo.setAttribute('size', new THREE.BufferAttribute(siz, 1));

  const uniforms = { amt: { value: 0 } };
  const mat = new THREE.ShaderMaterial({
    vertexShader: GAL_VERT,
    fragmentShader: GAL_FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
  const points = new THREE.Points(geo, mat);

  const coreUniforms = { amt: { value: 0 } };
  const coreMat = new THREE.ShaderMaterial({
    vertexShader: QUAD_VERT,
    fragmentShader: CORE_FRAG,
    uniforms: coreUniforms,
    fog: false,
    ...GLOW_BLEND,
  });
  const core = new THREE.Mesh(new THREE.PlaneGeometry(R_CORE * 4, R_CORE * 4), coreMat);

  const washUniforms = { amt: { value: 0 } };
  const washMat = new THREE.ShaderMaterial({
    vertexShader: QUAD_VERT,
    fragmentShader: DISC_FRAG,
    uniforms: washUniforms,
    fog: false,
    ...GLOW_BLEND,
  });
  const wash = new THREE.Mesh(new THREE.PlaneGeometry(R_MAX * 1.8, R_MAX * 1.8), washMat);
  wash.rotation.x = -Math.PI / 2; // PlaneGeometry is XY; the star field is XZ

  // Tilt: near face-on reads as a flat sticker, edge-on hides the arms.
  const disc = new THREE.Group();
  disc.rotation.x = THREE.MathUtils.degToRad(61);
  disc.rotation.z = THREE.MathUtils.degToRad(-14);
  disc.add(points);
  disc.add(wash);

  const group = new THREE.Group();
  group.add(disc);
  group.add(core);
  group.visible = false;

  // Swings in from the upper left and settles near centre: it is wide and
  // diffuse, so unlike the spheres it reads fine with content over it.
  // The exit key drops the core well clear of the closing CTA card — parked
  // behind it, the brightest part of the galaxy just turns into a grey haze
  // showing through a semi-opaque panel.
  // On a phone the CTA spans the full width, so there is no sideways escape:
  // the core drops straight down past the card's bottom edge instead.
  const KEYS = [
    new THREE.Vector3(-26, 14, 0),
    new THREE.Vector3(0, -2, 0),
    small ? new THREE.Vector3(-8, -32, 0) : new THREE.Vector3(-34, -30, 0),
  ];
  const FAR = 340;
  // Stops closing early enough that the whole disc still fits the frame at the
  // foot of the page. Pressed nearer, the arms crop and it reads as a smear.
  const NEAR = small ? 175 : 135;

  return {
    object: group,
    update(t, amt, lp, camera) {
      group.visible = amt > 0.004;
      if (!group.visible) return;
      uniforms.amt.value = amt;
      coreUniforms.amt.value = amt;
      washUniforms.amt.value = amt;
      // No recede: the galaxy is where the journey ends, so it keeps closing.
      flyPath(group.position, lp, KEYS, FAR, NEAR, false);
      // Slow enough to read as majesty rather than a spinning pinwheel. The wash
      // rides inside the disc group, so it turns with the arms for free.
      points.rotation.y = -t * 0.012 - lp * 0.35;
      core.quaternion.copy(camera.quaternion);
    },
    dispose() {
      geo.dispose();
      mat.dispose();
      core.geometry.dispose();
      coreMat.dispose();
      wash.geometry.dispose();
      washMat.dispose();
    },
  };
};
