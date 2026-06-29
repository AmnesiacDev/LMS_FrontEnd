import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './HeroLabScene.css';

const createCodeTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#142033';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(72, 211, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 211, 76, 0.08)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const rows = [
    ['const', 'quest', '=', 'new', 'Project();'],
    ['for', '(step', 'of', 'journey)', '{'],
    ['  learn(step);'],
    ['  build(miniGame);'],
    ['  unlockBadge();'],
    ['}'],
  ];

  ctx.font = '700 30px "Consolas", "Courier New", monospace';
  rows.forEach((row, rowIndex) => {
    let x = 58;
    const y = 86 + rowIndex * 58;
    row.forEach((word, wordIndex) => {
      const hue = ['#7dd3fc', '#fde047', '#c4b5fd', '#86efac', '#fda4af'][wordIndex % 5];
      ctx.fillStyle = hue;
      ctx.fillText(word, x, y);
      x += ctx.measureText(word).width + 18;
    });
  });

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

const createRoundedBox = (width, height, depth, radius, smoothness) => {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: smoothness,
    bevelSize: radius * 0.36,
    bevelThickness: radius * 0.28,
  });
};

const HeroLabScene = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    const container = sceneRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    camera.position.set(0.4, 3.2, 9.4);
    camera.lookAt(0, 0.55, 0);

    const root = new THREE.Group();
    scene.add(root);

    const ambient = new THREE.HemisphereLight(0xeaf7ff, 0xf3d3a3, 2.2);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 3.6);
    key.position.set(4, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);

    const rim = new THREE.PointLight(0x44d8ff, 30, 18);
    rim.position.set(-4, 2.2, 3);
    scene.add(rim);

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xdff3ff,
      roughness: 0.78,
      metalness: 0.04,
      transparent: true,
      opacity: 0.6,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(13, 9), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.35;
    floor.receiveShadow = true;
    root.add(floor);

    const grid = new THREE.GridHelper(13, 13, 0x1a3552, 0x52c7e8);
    grid.position.y = -1.32;
    grid.material.transparent = true;
    grid.material.opacity = 0.2;
    root.add(grid);

    const screenGroup = new THREE.Group();
    screenGroup.position.set(1.35, 0.7, 0.2);
    screenGroup.rotation.y = -0.28;
    screenGroup.rotation.x = 0.05;
    root.add(screenGroup);

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x172033,
      roughness: 0.45,
      metalness: 0.18,
    });
    const screenFrame = new THREE.Mesh(
      createRoundedBox(3.25, 2.18, 0.16, 0.16, 6),
      frameMaterial
    );
    screenFrame.castShadow = true;
    screenFrame.receiveShadow = true;
    screenGroup.add(screenFrame);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.84, 1.74),
      new THREE.MeshBasicMaterial({ map: createCodeTexture() })
    );
    screen.position.z = 0.105;
    screenGroup.add(screen);

    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.82, 0.24),
      frameMaterial
    );
    stand.position.set(0, -1.44, -0.02);
    stand.castShadow = true;
    screenGroup.add(stand);

    const base = new THREE.Mesh(
      createRoundedBox(1.3, 0.18, 0.7, 0.08, 5),
      frameMaterial
    );
    base.position.set(0, -1.95, 0.06);
    base.rotation.x = -Math.PI / 2;
    base.castShadow = true;
    screenGroup.add(base);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.92, 1),
      new THREE.MeshStandardMaterial({
        color: 0x6d5cff,
        roughness: 0.25,
        metalness: 0.18,
        emissive: 0x14105c,
        emissiveIntensity: 0.22,
      })
    );
    core.position.set(-1.85, 0.54, 0.15);
    core.castShadow = true;
    root.add(core);

    const coreWire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.04, 1),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.34,
      })
    );
    core.add(coreWire);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffc857,
      transparent: true,
      opacity: 0.82,
    });
    const rings = [1.52, 1.9, 2.26].map((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.011, 10, 120), ringMaterial);
      ring.rotation.x = Math.PI / 2 + index * 0.34;
      ring.rotation.y = index * 0.5;
      ring.position.copy(core.position);
      root.add(ring);
      return ring;
    });

    const tokenMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x36c8f4, roughness: 0.42, metalness: 0.08 }),
      new THREE.MeshStandardMaterial({ color: 0xffc857, roughness: 0.46, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ color: 0xff6b7a, roughness: 0.44, metalness: 0.05 }),
      new THREE.MeshStandardMaterial({ color: 0x2fd07f, roughness: 0.48, metalness: 0.05 }),
    ];

    const tokens = Array.from({ length: 18 }, (_, index) => {
      const geometry = index % 3 === 0
        ? new THREE.BoxGeometry(0.24, 0.24, 0.24)
        : index % 3 === 1
          ? new THREE.OctahedronGeometry(0.18, 0)
          : new THREE.TetrahedronGeometry(0.22, 0);
      const token = new THREE.Mesh(geometry, tokenMaterials[index % tokenMaterials.length]);
      const angle = index / 18 * Math.PI * 2;
      const radius = 2.5 + (index % 4) * 0.23;
      token.position.set(
        Math.cos(angle) * radius - 0.62,
        Math.sin(index * 1.7) * 0.42 + 0.42,
        Math.sin(angle) * 0.92 + 0.42
      );
      token.userData = { angle, radius, lift: index * 0.54 };
      token.castShadow = true;
      root.add(token);
      return token;
    });

    const pathLineMaterial = new THREE.MeshBasicMaterial({
      color: 0x123d5d,
      transparent: true,
      opacity: 0.26,
    });
    const pathPoints = [
      new THREE.Vector3(-4.8, -0.9, 0.4),
      new THREE.Vector3(-3.1, -0.45, -0.18),
      new THREE.Vector3(-1.78, 0.24, 0.18),
      new THREE.Vector3(-0.1, -0.08, -0.26),
      new THREE.Vector3(1.45, 0.5, 0.12),
      new THREE.Vector3(3.35, 0.1, -0.34),
    ];
    const pathCurve = new THREE.CatmullRomCurve3(pathPoints);
    const pathGeometry = new THREE.TubeGeometry(pathCurve, 80, 0.018, 8, false);
    const path = new THREE.Mesh(pathGeometry, pathLineMaterial);
    root.add(path);

    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.04,
      emissive: 0x5ed7ff,
      emissiveIntensity: 0.08,
    });
    const nodes = pathPoints.map((point, index) => {
      const node = new THREE.Mesh(
        index === 2 ? new THREE.SphereGeometry(0.18, 24, 18) : new THREE.SphereGeometry(0.12, 20, 14),
        nodeMaterial
      );
      node.position.copy(point);
      node.castShadow = true;
      root.add(node);
      return node;
    });

    const mouse = new THREE.Vector2(0, 0);
    const handlePointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    let frame = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();

      root.rotation.y += ((mouse.x * 0.1) - root.rotation.y) * 0.025;
      root.rotation.x += ((-mouse.y * 0.045) - root.rotation.x) * 0.025;
      core.rotation.x = elapsed * 0.35;
      core.rotation.y = elapsed * 0.5;
      core.position.y = 0.54 + Math.sin(elapsed * 1.5) * 0.08;

      rings.forEach((ring, index) => {
        ring.position.y = core.position.y;
        ring.rotation.z = elapsed * (0.12 + index * 0.035);
      });

      tokens.forEach((token, index) => {
        const angle = token.userData.angle + elapsed * (0.2 + (index % 4) * 0.025);
        token.position.x = Math.cos(angle) * token.userData.radius - 0.62;
        token.position.z = Math.sin(angle) * 0.92 + 0.42;
        token.position.y = Math.sin(elapsed * 1.2 + token.userData.lift) * 0.46 + 0.44;
        token.rotation.x += 0.012 + index * 0.0008;
        token.rotation.y += 0.016 + index * 0.0006;
      });

      nodes.forEach((node, index) => {
        const pulse = 1 + Math.sin(elapsed * 2.3 + index) * 0.08;
        node.scale.setScalar(pulse);
      });

      renderer.render(scene, camera);
      if (!reducedMotion) frame = requestAnimationFrame(animate);
    };

    resize();
    container.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('resize', resize);

    if (reducedMotion) renderer.render(scene, camera);
    else animate();

    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      scene.traverse((object) => {
        if (!object.isMesh) return;
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else object.material?.dispose();
      });
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={sceneRef} className="hero-lab-scene" aria-hidden="true">
      <div className="hero-lab-scene__glow" />
    </div>
  );
};

export default HeroLabScene;
