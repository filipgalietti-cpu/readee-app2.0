"use client";

/**
 * MysteryBox3D — a faithful React port of the Claude Design
 * `mystery-box-scene.js` (the violet question-mark box with the
 * treasure-chest payoff) + the `three-d-stage.js` WebGL host.
 *
 * The whole three.js scene is built inside a single effect against a
 * container ref: renderer + studio lighting + orbit turntable, the box
 * geometry, the treasure that rises as the lid clears, and the burst
 * (sparkles + tumbling carrots). Everything disposes on unmount.
 *
 * The parent drives the ceremony imperatively:
 *   ref.charge(hex) → tension rumble + rarity-tinted glow
 *   ref.open()      → lid blows off, treasure rises, burst fires
 *   ref.close()     → back to a closed, idle box
 * and listens for a tap (onTap) and the lid-cleared moment (onPop).
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type MysteryBox3DHandle = {
  charge: (hex?: string) => void;
  open: () => void;
  close: () => void;
};

type Props = {
  onTap?: () => void;
  onPop?: () => void;
  onReady?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export const MysteryBox3D = forwardRef<MysteryBox3DHandle, Props>(function MysteryBox3D(
  { onTap, onPop, onReady, className, style },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<MysteryBox3DHandle | null>(null);

  // Keep callback refs fresh so the long-lived rAF loop never calls stale ones.
  const onTapRef = useRef(onTap);
  const onPopRef = useRef(onPop);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onTapRef.current = onTap;
    onPopRef.current = onPop;
    onReadyRef.current = onReady;
  });

  useImperativeHandle(ref, () => ({
    charge: (hex?: string) => apiRef.current?.charge(hex),
    open: () => apiRef.current?.open(),
    close: () => apiRef.current?.close(),
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Renderer / scene / camera / lights (from three-d-stage._boot) ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.outline = "none";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
    camera.position.set(3, 2.2, 4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.addEventListener("start", () => {
      controls.autoRotate = false;
    });

    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 1.0));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 7, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff4e6, 0.5);
    fill.position.set(-5, 3, -4);
    scene.add(fill);

    // ── Materials ──────────────────────────────────────────────────
    const disposables: Array<{ dispose: () => void }> = [];
    const mat = <T extends THREE.Material>(m: T): T => {
      disposables.push(m);
      return m;
    };
    const geo = <T extends THREE.BufferGeometry>(g: T): T => {
      disposables.push(g);
      return g;
    };

    const violet = mat(new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.42 }));
    const violetDeep = mat(new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.5 }));
    const indigo = mat(new THREE.MeshStandardMaterial({ color: 0x4338ca, roughness: 0.34, metalness: 0.12 }));
    const amber = mat(
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.28, metalness: 0.35, emissive: 0xf59e0b, emissiveIntensity: 0.2 }),
    );
    const gold = mat(new THREE.MeshStandardMaterial({ color: 0xf5c542, roughness: 0.3, metalness: 0.35 }));
    const innerDark = mat(new THREE.MeshStandardMaterial({ color: 0x2e1065, roughness: 0.95, side: THREE.DoubleSide }));
    const leaf = mat(new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.75 }));
    const carrotOrange = mat(new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.55 }));

    function roundedBox(w: number, h: number, d: number, r: number, seg = 5) {
      const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg);
      const pos = g.attributes.position;
      const hw = w / 2 - r,
        hh = h / 2 - r,
        hd = d / 2 - r;
      const v = new THREE.Vector3(),
        c = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        c.set(Math.max(-hw, Math.min(hw, v.x)), Math.max(-hh, Math.min(hh, v.y)), Math.max(-hd, Math.min(hd, v.z)));
        v.sub(c).normalize().multiplyScalar(r).add(c);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      g.computeVertexNormals();
      return geo(g);
    }

    function qmarkTexture() {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const x = c.getContext("2d")!;
      x.clearRect(0, 0, 256, 256);
      x.font = '900 210px "Baloo 2", "Nunito", sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.lineWidth = 16;
      x.strokeStyle = "#4c1d95";
      x.strokeText("?", 128, 138);
      x.fillStyle = "#ffe9a3";
      x.fillText("?", 128, 138);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      disposables.push(t);
      return t;
    }

    const S = 0.78,
      LID = 0.2,
      bodyH = S - LID;
    const box = new THREE.Group();

    // Open-topped shell: four walls + a floor, so the treasure is visible.
    const wallT = 0.055;
    for (const [nx, nz, w, d] of [
      [0, 1, S, wallT],
      [0, -1, S, wallT],
      [1, 0, wallT, S],
      [-1, 0, wallT, S],
    ] as const) {
      const wall = new THREE.Mesh(roundedBox(w, bodyH, d, 0.022), violet);
      wall.position.set(nx * (S / 2 - wallT / 2), bodyH / 2, nz * (S / 2 - wallT / 2));
      box.add(wall);
    }
    const inner = new THREE.Mesh(roundedBox(S - wallT * 2 + 0.004, bodyH - 0.02, S - wallT * 2 + 0.004, 0.01), innerDark);
    inner.position.y = bodyH / 2 - 0.02;
    box.add(inner);

    const floor = new THREE.Mesh(roundedBox(S, 0.06, S, 0.02), violetDeep);
    floor.position.y = 0.03;
    box.add(floor);

    const foot = new THREE.Mesh(roundedBox(S + 0.03, 0.055, S + 0.03, 0.022), violetDeep);
    foot.position.y = 0.028;
    box.add(foot);

    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const rib = new THREE.Mesh(roundedBox(0.085, bodyH + 0.01, 0.085, 0.03), indigo);
        rib.position.set(sx * (S / 2 - 0.026), bodyH / 2, sz * (S / 2 - 0.026));
        box.add(rib);
      }

    const qTex = qmarkTexture();
    const qMats: THREE.MeshStandardMaterial[] = [];
    for (let i = 0; i < 4; i++) {
      const m = mat(
        new THREE.MeshStandardMaterial({ map: qTex, transparent: true, roughness: 0.4, emissive: 0xffd76a, emissiveMap: qTex, emissiveIntensity: 0.6 }),
      );
      qMats.push(m);
      const q = new THREE.Mesh(geo(new THREE.PlaneGeometry(0.34, 0.34)), m);
      q.position.set(0, bodyH * 0.52, 0);
      q.rotation.y = (i * Math.PI) / 2;
      q.translateZ(S / 2 + 0.004);
      box.add(q);
    }

    const lid = new THREE.Group();
    lid.position.y = bodyH;
    box.add(lid);

    const lidSlab = new THREE.Mesh(roundedBox(S + 0.05, LID, S + 0.05, 0.07), mat(violet.clone()));
    lidSlab.position.y = LID / 2 - 0.01;
    lid.add(lidSlab);

    const lidBand = new THREE.Mesh(roundedBox(S + 0.075, 0.055, S + 0.075, 0.026), mat(indigo.clone()));
    lidBand.position.y = 0.012;
    lid.add(lidBand);

    const lidStud = new THREE.Mesh(geo(new THREE.SphereGeometry(0.055, 22, 16)), mat(amber.clone()));
    lidStud.position.y = LID + 0.01;
    lid.add(lidStud);

    const lidMats = [lidSlab.material, lidBand.material, lidStud.material] as THREE.MeshStandardMaterial[];
    lidMats.forEach((m) => {
      m.transparent = true;
    });

    function makeCarrot(scale = 1) {
      const c = new THREE.Group();
      const s = scale;
      const pts = [
        new THREE.Vector2(0.001, 0),
        new THREE.Vector2(0.016 * s, 0.015 * s),
        new THREE.Vector2(0.032 * s, 0.05 * s),
        new THREE.Vector2(0.044 * s, 0.09 * s),
        new THREE.Vector2(0.05 * s, 0.125 * s),
        new THREE.Vector2(0.046 * s, 0.15 * s),
        new THREE.Vector2(0.03 * s, 0.163 * s),
        new THREE.Vector2(0.001, 0.168 * s),
      ];
      const bodyM = new THREE.Mesh(geo(new THREE.LatheGeometry(pts, 24)), carrotOrange);
      bodyM.position.y = -0.08 * s;
      c.add(bodyM);
      for (let i = 0; i < 3; i++) {
        const fr = new THREE.Mesh(geo(new THREE.SphereGeometry(0.018 * s, 10, 8)), leaf);
        fr.scale.set(0.7, 1.8, 0.7);
        fr.position.set((i - 1) * 0.016 * s, 0.098 * s, 0);
        fr.rotation.z = (i - 1) * 0.45;
        c.add(fr);
      }
      return c;
    }

    // What's inside: the chest's treasure, sized for this box.
    const treasure = new THREE.Group();
    treasure.position.y = bodyH - 0.06;
    const mound = new THREE.Mesh(geo(new THREE.SphereGeometry(0.19, 24, 16)), gold);
    mound.scale.set(1.5, 0.5, 1.5);
    treasure.add(mound);
    for (let i = 0; i < 5; i++) {
      const coin = new THREE.Mesh(geo(new THREE.SphereGeometry(0.042, 14, 10)), gold);
      const a = (i / 5) * Math.PI * 2;
      coin.position.set(Math.cos(a) * 0.16, 0.07, Math.sin(a) * 0.16);
      treasure.add(coin);
    }
    const heroCarrot = makeCarrot(1.3);
    heroCarrot.position.set(0.01, 0.19, 0.02);
    heroCarrot.rotation.z = 0.16;
    treasure.add(heroCarrot);
    const sideCarrot = makeCarrot(0.95);
    sideCarrot.position.set(-0.17, 0.12, -0.07);
    sideCarrot.rotation.z = -0.5;
    treasure.add(sideCarrot);
    treasure.scale.setScalar(0.001);
    treasure.visible = false;
    box.add(treasure);

    scene.add(box);

    // Frame the camera to the box's bounds (from three-d-stage.setObject).
    {
      const b = new THREE.Box3().setFromObject(box);
      if (!b.isEmpty()) {
        const sphere = b.getBoundingSphere(new THREE.Sphere());
        const dist = (sphere.radius / Math.tan((camera.fov * Math.PI) / 360)) * 1.35;
        const dir = new THREE.Vector3(1, 0.55, 1.25).normalize();
        camera.position.copy(sphere.center).add(dir.multiplyScalar(dist));
        camera.near = Math.max(dist / 100, 0.01);
        camera.far = dist * 100;
        camera.updateProjectionMatrix();
        controls.target.copy(sphere.center);
        controls.update();
      }
    }

    // ── FX group: glow, light shaft, motes, burst sparkles + carrots ──
    const fx = new THREE.Group();
    scene.add(fx);

    const glowLight = new THREE.PointLight(0xffd76a, 0, 2.6, 1.5);
    glowLight.position.set(0, bodyH + 0.2, 0);
    fx.add(glowLight);

    const gc = document.createElement("canvas");
    gc.width = 2;
    gc.height = 128;
    const gx = gc.getContext("2d")!;
    const grad = gx.createLinearGradient(0, 128, 0, 0);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.55)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    gx.fillStyle = grad;
    gx.fillRect(0, 0, 2, 128);
    const gradTex = new THREE.CanvasTexture(gc);
    disposables.push(gradTex);
    const raysMat = mat(
      new THREE.MeshBasicMaterial({
        color: 0xffe9a3,
        transparent: true,
        opacity: 0,
        map: gradTex,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    const rays = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.8, 0.16, 3.2, 24, 1, true)), raysMat);
    rays.position.set(0, bodyH + 1.6, 0);
    fx.add(rays);

    const M = 26;
    const mPos = new Float32Array(M * 3);
    const motes: Array<{ r: number; a: number; y: number; sp: number; bob: number }> = [];
    for (let i = 0; i < M; i++) {
      motes.push({ r: 0.55 + Math.random() * 0.4, a: Math.random() * Math.PI * 2, y: 0.1 + Math.random() * 0.8, sp: 0.25 + Math.random() * 0.5, bob: Math.random() * 6 });
    }
    const mGeo = geo(new THREE.BufferGeometry());
    mGeo.setAttribute("position", new THREE.BufferAttribute(mPos, 3));
    const mMat = mat(new THREE.PointsMaterial({ color: 0xa78bfa, size: 0.03, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    const moteCloud = new THREE.Points(mGeo, mMat);
    moteCloud.frustumCulled = false;
    fx.add(moteCloud);

    const NUM = 170;
    const sPos = new Float32Array(NUM * 3);
    const sVel = new Float32Array(NUM * 3);
    const sCol = new Float32Array(NUM * 3);
    const palette = [new THREE.Color(0xf5c542), new THREE.Color(0x7c3aed), new THREE.Color(0x4338ca), new THREE.Color(0xffe9a3), new THREE.Color(0xffffff)];
    for (let i = 0; i < NUM; i++) {
      sPos[i * 3 + 1] = -10;
      const c = palette[i % palette.length];
      sCol[i * 3] = c.r;
      sCol[i * 3 + 1] = c.g;
      sCol[i * 3 + 2] = c.b;
    }
    const sGeo = geo(new THREE.BufferGeometry());
    sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    sGeo.setAttribute("color", new THREE.BufferAttribute(sCol, 3));
    const sMat = mat(
      new THREE.PointsMaterial({ size: 0.038, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }),
    );
    const sparkles = new THREE.Points(sGeo, sMat);
    sparkles.frustumCulled = false;
    fx.add(sparkles);

    const burstCarrots: Array<{ m: THREE.Group; v: THREE.Vector3; w: THREE.Vector3 }> = [];
    for (let i = 0; i < 7; i++) {
      const c = makeCarrot(0.9);
      c.visible = false;
      fx.add(c);
      burstCarrots.push({ m: c, v: new THREE.Vector3(), w: new THREE.Vector3() });
    }

    // ── Animation state ────────────────────────────────────────────
    let open = false,
      lidA = 0,
      lidV = 0,
      glow = 0,
      vanish = 0;
    let burstT = -10,
      openT = -10,
      popped = false;
    let charging = false,
      chargeT = -10,
      charge = 0;
    let tint: string | null = null;
    let last = performance.now() / 1000;
    let rafId = 0;

    function triggerBurst() {
      burstT = performance.now() / 1000;
      if (tint) {
        const c = new THREE.Color(tint);
        for (let i = 0; i < NUM; i++) {
          const mix = i % 3 === 0 ? new THREE.Color(0xffffff) : c;
          sCol[i * 3] = mix.r;
          sCol[i * 3 + 1] = mix.g;
          sCol[i * 3 + 2] = mix.b;
        }
        sGeo.attributes.color.needsUpdate = true;
        raysMat.color.set(tint);
        glowLight.color.set(tint);
        mMat.color.set(tint);
      }
      for (let i = 0; i < NUM; i++) {
        sPos[i * 3] = (Math.random() - 0.5) * 0.45;
        sPos[i * 3 + 1] = bodyH + 0.05 + Math.random() * 0.15;
        sPos[i * 3 + 2] = (Math.random() - 0.5) * 0.45;
        const a = Math.random() * Math.PI * 2;
        const sp = 0.5 + Math.random() * 1.5;
        sVel[i * 3] = Math.cos(a) * sp * 0.6;
        sVel[i * 3 + 1] = 1.3 + Math.random() * 1.9;
        sVel[i * 3 + 2] = Math.sin(a) * sp * 0.6;
      }
      sGeo.attributes.position.needsUpdate = true;
      for (const bc of burstCarrots) {
        bc.m.visible = true;
        bc.m.scale.setScalar(1);
        bc.m.position.set((Math.random() - 0.5) * 0.3, bodyH + 0.1, (Math.random() - 0.5) * 0.2);
        const a = Math.random() * Math.PI * 2;
        bc.v.set(Math.cos(a) * (0.4 + Math.random() * 0.5), 1.6 + Math.random() * 1.0, Math.sin(a) * (0.4 + Math.random() * 0.5));
        bc.w.set(Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3);
      }
    }

    function tick() {
      rafId = requestAnimationFrame(tick);
      const now = performance.now() / 1000;
      const dt = Math.min(now - last, 0.05);
      last = now;

      const target = open ? 1 : 0;
      lidV += ((target - lidA) * (open ? 110 : 78) - lidV * (open ? 8.2 : 11.5)) * dt;
      lidA += lidV * dt;
      const l = Math.max(0, lidA);

      const vTarget = open && now - openT > 0.55 ? 1 : 0;
      vanish += (vTarget - vanish) * Math.min(dt * (vTarget > vanish ? 4 : 7), 1);
      if (vanish < 0.002) vanish = 0;
      lid.visible = vanish < 0.99;
      lid.scale.setScalar(Math.max(0.001, 1 - vanish * 0.45));
      lidMats.forEach((m) => {
        m.opacity = 1 - vanish;
      });
      lid.position.y = bodyH + l * 0.5 + vanish * 0.55;
      lid.rotation.set(l * 0.22 + vanish * 0.5, l * (1.5 + Math.sin(now * 0.7) * 0.35) + vanish * 2.2, l * -0.16);
      lid.position.x = Math.sin(now * 1.1) * 0.02 * l;

      // Treasure rises out of the box behind the lid.
      const tShow = Math.max(0.001, Math.min(1, (l - 0.18) / 0.62));
      treasure.visible = l > 0.08;
      treasure.scale.setScalar(tShow < 1 ? tShow * (1.18 - 0.18 * tShow) : 1);
      treasure.position.y = bodyH - 0.06 + tShow * 0.1;
      treasure.rotation.y = now * 0.5;

      const at = now - openT;
      const squash = at < 0.32 ? Math.sin((at / 0.32) * Math.PI) * 0.07 : 0;

      charge += ((charging ? 1 : 0) - charge) * Math.min(dt * (charging ? 2.2 : 9), 1);
      const ct = charging ? Math.min((now - chargeT) / 1.6, 1) : 0;
      const rumble = charge * (0.004 + ct * ct * 0.026);
      box.position.x = (Math.random() - 0.5) * rumble * 2;
      box.position.z = (Math.random() - 0.5) * rumble * 2;
      box.rotation.z = Math.sin(now * 46) * rumble * 0.8;
      box.position.y = Math.sin(now * 1.25) * (0.018 + (1 - glow) * 0.012) + charge * ct * 0.05;
      box.scale.set(1 + squash + charge * ct * 0.035, 1 - squash * 0.9 + charge * ct * 0.035, 1 + squash + charge * ct * 0.035);

      glow += ((open ? 1 : 0) - glow) * Math.min(dt * 4.5, 1);
      glowLight.intensity = glow * 3.0 + charge * ct * 1.6;
      raysMat.opacity = glow * 0.36 + charge * ct * 0.12;
      rays.scale.y = 0.6 + glow * 0.4;
      rays.rotation.y = now * 0.4;

      const pulse = Math.sin(now * 2.4) * 0.5 + 0.5;
      const chargePulse = Math.sin(now * (7 + ct * 30)) * 0.5 + 0.5;
      for (const m of qMats) {
        m.emissiveIntensity = 0.25 + (1 - glow) * (0.45 + pulse * 0.95) + charge * (0.6 + chargePulse * 2.6 * ct);
      }
      amber.emissiveIntensity = 0.15 + pulse * 0.35 * (1 - glow * 0.6);

      for (let i = 0; i < M; i++) {
        const mo = motes[i];
        mo.a += mo.sp * dt * (1 + glow * 2.2 + charge * ct * 9);
        const r = mo.r * (1 - glow * 0.45) * (1 - charge * ct * 0.72);
        mPos[i * 3] = Math.cos(mo.a) * r;
        mPos[i * 3 + 1] = mo.y + Math.sin(now * 0.9 + mo.bob) * 0.07 + glow * 0.35 + charge * ct * 0.25;
        mPos[i * 3 + 2] = Math.sin(mo.a) * r;
      }
      mGeo.attributes.position.needsUpdate = true;
      mMat.opacity = Math.max(charge * 0.9, glow * 0.5);
      mMat.size = 0.03 + charge * ct * 0.042;

      if (open && !popped && l > 0.55) {
        popped = true;
        onPopRef.current?.();
      }

      const bt = now - burstT;
      if (bt < 2.0) {
        for (let i = 0; i < NUM; i++) {
          sVel[i * 3 + 1] -= 2.1 * dt;
          sPos[i * 3] += sVel[i * 3] * dt;
          sPos[i * 3 + 1] += sVel[i * 3 + 1] * dt;
          sPos[i * 3 + 2] += sVel[i * 3 + 2] * dt;
        }
        sGeo.attributes.position.needsUpdate = true;
        sMat.opacity = bt < 0.25 ? bt / 0.25 : Math.max(0, 1 - (bt - 0.25) / 1.6);
      } else {
        sMat.opacity = 0;
      }

      if (bt < 2.4) {
        for (const bc of burstCarrots) {
          if (!bc.m.visible) continue;
          bc.v.y -= 3.4 * dt;
          bc.m.position.addScaledVector(bc.v, dt);
          if (bc.m.position.y < 0.07 && bc.v.y < 0) {
            bc.m.position.y = 0.07;
            bc.v.y *= -0.35;
            bc.v.x *= 0.7;
            bc.v.z *= 0.7;
            bc.w.multiplyScalar(0.5);
          }
          bc.m.rotation.x += bc.w.x * dt;
          bc.m.rotation.y += bc.w.y * dt;
          bc.m.rotation.z += bc.w.z * dt;
          if (bt > 1.7) bc.m.scale.setScalar(Math.max(0.001, 1 - (bt - 1.7) / 0.7));
        }
      } else {
        for (const bc of burstCarrots) bc.m.visible = false;
      }

      controls.update();
      renderer.render(scene, camera);
    }

    // ── Sizing ─────────────────────────────────────────────────────
    const fit = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(container);

    // ── Tap detection (from mystery-box-scene pointer handlers) ──────
    let downX = 0,
      downY = 0;
    const onDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 7) return;
      onTapRef.current?.();
    };
    const el = renderer.domElement;
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);

    // ── Imperative API (MysteryBoxScene contract) ───────────────────
    apiRef.current = {
      charge: (hex?: string) => {
        tint = hex || null;
        charging = true;
        chargeT = performance.now() / 1000;
      },
      open: () => {
        if (open) return;
        charging = false;
        open = true;
        popped = false;
        openT = performance.now() / 1000;
        triggerBurst();
      },
      close: () => {
        open = false;
        charging = false;
        popped = false;
      },
    };

    tick();
    onReadyRef.current?.();

    // ── Cleanup ─────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      controls.dispose();
      for (const d of disposables) {
        try {
          d.dispose();
        } catch {
          /* noop */
        }
      }
      renderer.dispose();
      if (el.parentNode === container) container.removeChild(el);
      apiRef.current = null;
    };
    // Build once; callbacks are read through refs.
  }, []);

  return <div ref={containerRef} className={className} style={{ width: "100%", height: "100%", ...style }} />;
});
