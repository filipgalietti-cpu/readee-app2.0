// 3D treasure chest — faithful port of the Claude Design "Journey Unlock"
// chest3d.js. Only change from the design: import three from the installed
// package instead of a CDN. Client-only (browser APIs); dynamic-import it so
// three.js is a lazy chunk that loads only when a chest opens.
import * as THREE from "three";

function roundedBox(w: number, h: number, d: number, r: number, seg = 4) {
  const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg);
  const pos = g.attributes.position;
  const hw = w / 2 - r, hh = h / 2 - r, hd = d / 2 - r;
  const v = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    c.set(Math.max(-hw, Math.min(hw, v.x)), Math.max(-hh, Math.min(hh, v.y)), Math.max(-hd, Math.min(hd, v.z)));
    v.sub(c).normalize().multiplyScalar(r).add(c);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

export interface ChestScene {
  open: () => void;
  close: () => void;
  dispose: () => void;
}

export function createChestScene(container: HTMLElement): ChestScene {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0.95, 0.8, 2.45);
  camera.lookAt(0, 0.30, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
  function resize() {
    const w = container.clientWidth || 1, h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(container);

  scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  const key = new THREE.DirectionalLight(0xfff4e0, 1.6); key.position.set(2, 3, 2.5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xdde4ff, 0.6); fill.position.set(-2, 1.5, -1.5); scene.add(fill);

  const wood = new THREE.MeshStandardMaterial({ color: 0xa56b3d, roughness: 0.82 });
  const woodDark = new THREE.MeshStandardMaterial({ color: 0x7a4a26, roughness: 0.9 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xf5c542, roughness: 0.3, metalness: 0.35 });
  const lining = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.95, side: THREE.DoubleSide });
  const dark = new THREE.MeshStandardMaterial({ color: 0x3a2c14, roughness: 0.6 });
  const leaf = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.75 });
  const carrotOrange = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.55 });

  const W = 0.92, H = 0.52, D = 0.60, R = D / 2;
  const chest = new THREE.Group();
  const body = new THREE.Mesh(roundedBox(W, H, D, 0.045), wood); body.position.y = H / 2; chest.add(body);
  const base = new THREE.Mesh(roundedBox(W + 0.05, 0.07, D + 0.05, 0.02), gold); base.position.y = 0.035; chest.add(base);
  for (let i = 0; i < 2; i++) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(W + 0.004, 0.014, D + 0.004), woodDark);
    seam.position.y = 0.19 + i * 0.17; chest.add(seam);
  }
  for (const sx of [-0.26, 0.26]) {
    const strap = new THREE.Mesh(roundedBox(0.085, H + 0.015, D + 0.035, 0.015), gold);
    strap.position.set(sx, H / 2, 0); chest.add(strap);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const br = new THREE.Mesh(roundedBox(0.09, 0.11, 0.09, 0.018), gold);
    br.position.set(sx * (W / 2 - 0.028), H - 0.05, sz * (D / 2 - 0.028)); chest.add(br);
  }

  const lid = new THREE.Group(); lid.position.set(0, H, -D / 2); chest.add(lid);
  const rim = new THREE.Mesh(roundedBox(W, 0.06, D, 0.02), woodDark); rim.position.set(0, 0.03, D / 2); lid.add(rim);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(R, R, W, 40, 1, true, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xa56b3d, roughness: 0.82, side: THREE.DoubleSide }));
  barrel.rotation.z = Math.PI / 2; barrel.position.set(0, 0.06, D / 2); lid.add(barrel);
  const liner = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.02, R - 0.02, W - 0.03, 32, 1, true, 0, Math.PI), lining);
  liner.rotation.z = Math.PI / 2; liner.position.set(0, 0.06, D / 2); lid.add(liner);
  const capShape = new THREE.Shape(); capShape.absarc(0, 0, R, 0, Math.PI, false);
  const capGeo = new THREE.ShapeGeometry(capShape, 24);
  for (const sx of [-1, 1]) {
    const cap = new THREE.Mesh(capGeo, new THREE.MeshStandardMaterial({ color: 0xa56b3d, roughness: 0.82, side: THREE.DoubleSide }));
    cap.rotation.y = sx * Math.PI / 2; cap.position.set(sx * W / 2, 0.06, D / 2); lid.add(cap);
  }
  for (const sx of [-0.26, 0.26]) {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(R + 0.012, 0.026, 12, 32, Math.PI), gold);
    arc.rotation.y = Math.PI / 2; arc.position.set(sx, 0.06, D / 2); lid.add(arc);
  }
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 16), gold);
  knob.position.set(0, 0.06 + R + 0.02, D / 2); lid.add(knob);
  const hasp = new THREE.Group(); hasp.position.set(0, 0.02, D + 0.005); lid.add(hasp);
  const haspPlate = new THREE.Mesh(roundedBox(0.10, 0.15, 0.028, 0.012), gold);
  haspPlate.position.set(0, -0.055, 0.006); hasp.add(haspPlate);

  const lockPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.035, 28), gold);
  lockPlate.rotation.x = Math.PI / 2; lockPlate.position.set(0, 0.385, D / 2 + 0.005); chest.add(lockPlate);
  const lockRingMat = new THREE.MeshStandardMaterial({ color: 0xf5c542, roughness: 0.35, metalness: 0.3, emissive: 0x4338ca, emissiveIntensity: 0 });
  const lockRing = new THREE.Mesh(new THREE.TorusGeometry(0.098, 0.013, 12, 36), lockRingMat);
  lockRing.position.copy(lockPlate.position); chest.add(lockRing);
  const keyC = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 16), dark);
  keyC.rotation.x = Math.PI / 2; keyC.position.set(0, 0.40, D / 2 + 0.026); chest.add(keyC);
  const keyB = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.045, 0.02), dark);
  keyB.position.set(0, 0.372, D / 2 + 0.026); chest.add(keyB);

  function makeCarrot(scale = 1) {
    const c = new THREE.Group(); const s = scale;
    const pts = [new THREE.Vector2(0.001, 0), new THREE.Vector2(0.016 * s, 0.015 * s), new THREE.Vector2(0.032 * s, 0.05 * s),
      new THREE.Vector2(0.044 * s, 0.09 * s), new THREE.Vector2(0.05 * s, 0.125 * s), new THREE.Vector2(0.046 * s, 0.15 * s),
      new THREE.Vector2(0.03 * s, 0.163 * s), new THREE.Vector2(0.001, 0.168 * s)];
    const bodyM = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), carrotOrange);
    bodyM.position.y = -0.08 * s; c.add(bodyM);
    for (let i = 0; i < 3; i++) {
      const fr = new THREE.Mesh(new THREE.SphereGeometry(0.018 * s, 10, 8), leaf);
      fr.scale.set(0.7, 1.8, 0.7); fr.position.set((i - 1) * 0.016 * s, 0.098 * s, 0); fr.rotation.z = (i - 1) * 0.45;
      c.add(fr);
    }
    return c;
  }

  const treasure = new THREE.Group(); treasure.position.y = H;
  const mound = new THREE.Mesh(new THREE.SphereGeometry(0.21, 24, 16), gold);
  mound.scale.set(1.6, 0.55, 1.1); treasure.add(mound);
  for (let i = 0; i < 5; i++) {
    const coin = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), gold);
    const a = i / 5 * Math.PI * 2;
    coin.position.set(Math.cos(a) * 0.19, 0.09, Math.sin(a) * 0.11); treasure.add(coin);
  }
  const heroCarrot = makeCarrot(1.35); heroCarrot.position.set(0.02, 0.20, 0.02); heroCarrot.rotation.z = 0.18; treasure.add(heroCarrot);
  const sideCarrot = makeCarrot(1.0); sideCarrot.position.set(-0.20, 0.13, -0.06); sideCarrot.rotation.z = -0.5; treasure.add(sideCarrot);
  treasure.scale.setScalar(0.001); treasure.visible = false; chest.add(treasure);
  chest.position.y = -0.28;
  scene.add(chest);

  const fx = new THREE.Group(); scene.add(fx);
  const glowLight = new THREE.PointLight(0xffd76a, 0, 2.4, 1.6); glowLight.position.set(0, H + 0.25 - 0.28, 0); fx.add(glowLight);
  // "Infinite light": a vertical gradient texture fades the beam to nothing at
  // the top (no hard cutoff), so it reads as light shooting up endlessly.
  const gradCanvas = document.createElement("canvas"); gradCanvas.width = 2; gradCanvas.height = 128;
  const gctx = gradCanvas.getContext("2d")!;
  // Fade to fully transparent LOW on the beam (by ~24% up) so it dissolves
  // inside the camera's tight frame — otherwise the tall cone is still ~60%
  // opaque where the view cuts it off, which reads as a hard edge.
  const grad = gctx.createLinearGradient(0, 128, 0, 0);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.1, "rgba(255,255,255,0.5)");
  grad.addColorStop(0.24, "rgba(255,255,255,0)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  gctx.fillStyle = grad; gctx.fillRect(0, 0, 2, 128);
  const gradTex = new THREE.CanvasTexture(gradCanvas);
  const raysMat = new THREE.MeshBasicMaterial({ color: 0xffe9a3, transparent: true, opacity: 0, map: gradTex, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const rays = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.16, 3.2, 24, 1, true), raysMat);
  rays.position.set(0, H + 1.6 - 0.28, 0); fx.add(rays);

  const N = 150;
  const sPos = new Float32Array(N * 3), sVel = new Float32Array(N * 3), sCol = new Float32Array(N * 3);
  const palette = [new THREE.Color(0xf5c542), new THREE.Color(0x7c3aed), new THREE.Color(0x4338ca), new THREE.Color(0xffffff)];
  for (let i = 0; i < N; i++) {
    sPos[i * 3 + 1] = -10;
    const c = palette[i % palette.length];
    sCol[i * 3] = c.r; sCol[i * 3 + 1] = c.g; sCol[i * 3 + 2] = c.b;
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
  sGeo.setAttribute("color", new THREE.BufferAttribute(sCol, 3));
  const sMat = new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
  const sparkles = new THREE.Points(sGeo, sMat); sparkles.frustumCulled = false; sparkles.position.y = -0.28; fx.add(sparkles);

  const burstCarrots: { m: THREE.Group; v: THREE.Vector3; w: THREE.Vector3 }[] = [];
  for (let i = 0; i < 6; i++) {
    const c = makeCarrot(0.9); c.visible = false; c.position.y = -10; fx.add(c);
    burstCarrots.push({ m: c, v: new THREE.Vector3(), w: new THREE.Vector3() });
  }

  let open = false, lidA = 0, lidV = 0, haspA = 0, haspV = 0, glow = 0, burstT = -10;
  let disposed = false, last = performance.now() / 1000;

  function triggerBurst(now: number) {
    burstT = now;
    for (let i = 0; i < N; i++) {
      sPos[i * 3] = (Math.random() - 0.5) * 0.5;
      sPos[i * 3 + 1] = H + 0.1 + Math.random() * 0.15;
      sPos[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
      const a = Math.random() * Math.PI * 2, sp = 0.5 + Math.random() * 1.4;
      sVel[i * 3] = Math.cos(a) * sp * 0.55;
      sVel[i * 3 + 1] = 1.2 + Math.random() * 1.8;
      sVel[i * 3 + 2] = Math.sin(a) * sp * 0.55;
    }
    sGeo.attributes.position.needsUpdate = true;
    for (const bc of burstCarrots) {
      bc.m.visible = true; bc.m.scale.setScalar(1);
      bc.m.position.set((Math.random() - 0.5) * 0.3, H + 0.15 - 0.28, (Math.random() - 0.5) * 0.2);
      const a = Math.random() * Math.PI * 2;
      bc.v.set(Math.cos(a) * (0.4 + Math.random() * 0.5), 1.6 + Math.random() * 1.0, Math.sin(a) * (0.4 + Math.random() * 0.5));
      bc.w.set(Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3);
    }
  }

  function tick() {
    if (disposed) return;
    requestAnimationFrame(tick);
    const now = performance.now() / 1000;
    const dt = Math.min(now - last, 0.05); last = now;
    const target = open ? 1.72 : 0, k = open ? 95 : 70, damp = open ? 8.5 : 11;
    lidV += ((target - lidA) * k - lidV * damp) * dt; lidA += lidV * dt; lid.rotation.x = -lidA;
    const hTarget = open ? 1.1 : 0;
    haspV += ((hTarget - haspA) * 160 - haspV * 10) * dt; haspA += haspV * dt; hasp.rotation.x = haspA;
    glow += ((open ? 1 : 0) - glow) * Math.min(dt * 4.5, 1);
    glowLight.intensity = glow * 2.6; raysMat.opacity = glow * 0.38;
    rays.scale.y = 0.6 + glow * 0.4; rays.rotation.y = now * 0.4;
    const tShow = Math.max(0.001, Math.min(1, (lidA - 0.25) / 0.9));
    treasure.visible = lidA > 0.1;
    treasure.scale.setScalar(tShow < 1 ? tShow * (1.15 - 0.15 * tShow) : 1);
    const pulse = Math.sin(now * 2.6) * 0.5 + 0.5;
    lockRingMat.emissiveIntensity = (1 - glow) * (0.35 + pulse * 1.1);
    chest.rotation.y = open ? chest.rotation.y * 0.96 : Math.sin(now * 0.5) * 0.22;
    const bt = now - burstT;
    if (bt < 2.0) {
      for (let i = 0; i < N; i++) {
        sVel[i * 3 + 1] -= 2.1 * dt;
        sPos[i * 3] += sVel[i * 3] * dt; sPos[i * 3 + 1] += sVel[i * 3 + 1] * dt; sPos[i * 3 + 2] += sVel[i * 3 + 2] * dt;
      }
      sGeo.attributes.position.needsUpdate = true;
      sMat.opacity = bt < 0.25 ? bt / 0.25 : Math.max(0, 1 - (bt - 0.25) / 1.6);
    } else sMat.opacity = 0;
    if (bt < 2.4) {
      for (const bc of burstCarrots) {
        if (!bc.m.visible) continue;
        bc.v.y -= 3.4 * dt;
        bc.m.position.addScaledVector(bc.v, dt);
        if (bc.m.position.y < 0.07 - 0.28 && bc.v.y < 0) {
          bc.m.position.y = 0.07 - 0.28; bc.v.y *= -0.35; bc.v.x *= 0.7; bc.v.z *= 0.7; bc.w.multiplyScalar(0.5);
        }
        bc.m.rotation.x += bc.w.x * dt; bc.m.rotation.y += bc.w.y * dt; bc.m.rotation.z += bc.w.z * dt;
        if (bt > 1.7) bc.m.scale.setScalar(Math.max(0.001, 1 - (bt - 1.7) / 0.7));
      }
    } else for (const bc of burstCarrots) bc.m.visible = false;
    renderer.render(scene, camera);
  }
  tick();

  return {
    open() { open = true; triggerBurst(performance.now() / 1000); },
    close() { open = false; },
    dispose() {
      disposed = true; ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    },
  };
}
