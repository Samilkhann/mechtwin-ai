/**
 * MechTwin AI - Interactive 3D Digital Twin CAD Viewer
 * High-fidelity Three.js assembly of Centrifugal Pump + Electric Motor
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Machine, MachineComponent } from '../../types';
import { Layers, RotateCw, ZoomIn, ZoomOut, Flame, Activity, Waves, Eye, Maximize2 } from 'lucide-react';

interface ThreeMachineViewerProps {
  machine: Machine;
  selectedComponent: MachineComponent | null;
  onSelectComponent: (comp: MachineComponent | null) => void;
  viewMode: 'cad' | 'thermal' | 'vibration' | 'flow' | 'xray';
  setViewMode: (mode: 'cad' | 'thermal' | 'vibration' | 'flow' | 'xray') => void;
  explodedProgress: number; // 0.0 - 1.0
  setExplodedProgress: (val: number) => void;
  isSimulating: boolean;
}

export const ThreeMachineViewer: React.FC<ThreeMachineViewerProps> = ({
  machine,
  selectedComponent,
  onSelectComponent,
  viewMode,
  setViewMode,
  explodedProgress,
  setExplodedProgress,
  isSimulating,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const partsMapRef = useRef<Map<string, THREE.Group | THREE.Mesh>>(new Map());
  const flowParticlesRef = useRef<THREE.Points | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [autoRotate, setAutoRotate] = useState(false);
  const [hoveredPartName, setHoveredPartName] = useState<string | null>(null);

  // Mouse interaction state for camera orbit
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 10.5, theta: Math.PI / 4, phi: Math.PI / 3.2 });
  const targetRef = useRef(new THREE.Vector3(0, 0.5, 0));

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x050811);
    scene.fog = new THREE.FogExp2(0x050811, 0.025);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(6, 12, 8);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dirLight2.position.set(-8, -4, -6);
    scene.add(dirLight2);

    const cyanSpot = new THREE.SpotLight(0x06b6d4, 2.5, 18, Math.PI / 4, 0.4);
    cyanSpot.position.set(0, 8, 4);
    scene.add(cyanSpot);

    // 5. Engineering Grid Floor & Baseplate
    const gridHelper = new THREE.GridHelper(16, 32, 0x0284c7, 0x1e293b);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);

    // Baseplate / Skid
    const skidGeo = new THREE.BoxGeometry(7.2, 0.35, 2.2);
    const skidMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.7 });
    const skid = new THREE.Mesh(skidGeo, skidMat);
    skid.position.set(-0.3, -1.0, 0);
    skid.receiveShadow = true;
    scene.add(skid);

    // 6. Construct Mechanical Assembly Parts
    const partsMap = new Map<string, THREE.Group | THREE.Mesh>();

    // --- Part A: Electric Motor ---
    const motorGroup = new THREE.Group();
    motorGroup.name = 'motor';
    
    // Motor Stator Frame (Cylinder with cooling fins)
    const statorGeo = new THREE.CylinderGeometry(1.0, 1.0, 2.2, 32);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.4, metalness: 0.65 });
    const stator = new THREE.Mesh(statorGeo, motorMat);
    stator.rotation.z = Math.PI / 2;
    stator.castShadow = true;
    stator.receiveShadow = true;
    motorGroup.add(stator);

    // Motor Cooling Fins (Array of thin disks)
    for (let i = -0.8; i <= 0.8; i += 0.22) {
      const finGeo = new THREE.CylinderGeometry(1.08, 1.08, 0.04, 32);
      const finMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.8 });
      const fin = new THREE.Mesh(finGeo, finMat);
      fin.rotation.z = Math.PI / 2;
      fin.position.x = i;
      motorGroup.add(fin);
    }

    // Terminal Box on top of motor
    const termBoxGeo = new THREE.BoxGeometry(0.7, 0.5, 0.6);
    const termBoxMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
    const termBox = new THREE.Mesh(termBoxGeo, termBoxMat);
    termBox.position.set(0, 1.25, 0);
    motorGroup.add(termBox);

    // Fan Cowl (back of motor)
    const cowlGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.4, 24);
    const cowlMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6, metalness: 0.4 });
    const cowl = new THREE.Mesh(cowlGeo, cowlMat);
    cowl.rotation.z = Math.PI / 2;
    cowl.position.x = -1.3;
    motorGroup.add(cowl);

    motorGroup.position.set(-2.0, 0, 0);
    scene.add(motorGroup);
    partsMap.set('motor', motorGroup);

    // --- Part B: NDE Bearing ---
    const bearingNDEGeo = new THREE.TorusGeometry(0.42, 0.12, 16, 32);
    const bearingMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.95 });
    const bearingNDE = new THREE.Mesh(bearingNDEGeo, bearingMat);
    bearingNDE.rotation.y = Math.PI / 2;
    bearingNDE.position.set(-3.0, 0, 0);
    bearingNDE.name = 'bearing_nde';
    scene.add(bearingNDE);
    partsMap.set('bearing_nde', bearingNDE);

    // --- Part C: DE Bearing ---
    const bearingDEGeo = new THREE.TorusGeometry(0.48, 0.14, 16, 32);
    const bearingDE = new THREE.Mesh(bearingDEGeo, bearingMat.clone());
    bearingDE.rotation.y = Math.PI / 2;
    bearingDE.position.set(-0.85, 0, 0);
    bearingDE.name = 'bearing_de';
    scene.add(bearingDE);
    partsMap.set('bearing_de', bearingDE);

    // --- Part D: Flexible Coupling ---
    const couplingGroup = new THREE.Group();
    couplingGroup.name = 'coupling';
    const cHub1 = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.35, 24), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 }));
    cHub1.rotation.z = Math.PI / 2;
    cHub1.position.x = -0.22;
    couplingGroup.add(cHub1);

    const cSpider = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 24), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.1 }));
    cSpider.rotation.z = Math.PI / 2;
    couplingGroup.add(cSpider);

    const cHub2 = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.35, 24), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 }));
    cHub2.rotation.z = Math.PI / 2;
    cHub2.position.x = 0.22;
    couplingGroup.add(cHub2);

    couplingGroup.position.set(-0.25, 0, 0);
    scene.add(couplingGroup);
    partsMap.set('coupling', couplingGroup);

    // --- Part E: Steel Drive Shaft ---
    const shaftGeo = new THREE.CylinderGeometry(0.24, 0.24, 4.4, 32);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.98 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.set(0.1, 0, 0);
    shaft.name = 'shaft';
    scene.add(shaft);
    partsMap.set('shaft', shaft);

    // --- Part F: Mechanical Seal Gland ---
    const sealGroup = new THREE.Group();
    sealGroup.name = 'seal';
    const sealGland = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.25, 24), new THREE.MeshStandardMaterial({ color: 0xec4899, metalness: 0.8, roughness: 0.3 }));
    sealGland.rotation.z = Math.PI / 2;
    sealGroup.add(sealGland);
    sealGroup.position.set(0.85, 0, 0);
    scene.add(sealGroup);
    partsMap.set('seal', sealGroup);

    // --- Part G: Pump Volute Casing ---
    const casingGroup = new THREE.Group();
    casingGroup.name = 'casing';
    const voluteBody = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.55, 24, 32), new THREE.MeshStandardMaterial({ color: 0x4f46e5, metalness: 0.7, roughness: 0.4 }));
    voluteBody.rotation.y = Math.PI / 2;
    casingGroup.add(voluteBody);

    const backPlate = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.3, 32), new THREE.MeshStandardMaterial({ color: 0x3730a3, metalness: 0.75, roughness: 0.4 }));
    backPlate.rotation.z = Math.PI / 2;
    backPlate.position.x = -0.3;
    casingGroup.add(backPlate);

    casingGroup.position.set(1.5, 0, 0);
    scene.add(casingGroup);
    partsMap.set('casing', casingGroup);

    // --- Part H: Internal Impeller ---
    const impellerGroup = new THREE.Group();
    impellerGroup.name = 'impeller';
    const impHub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, 0.35, 16), new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 }));
    impHub.rotation.z = Math.PI / 2;
    impellerGroup.add(impHub);

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const vaneGeo = new THREE.BoxGeometry(0.04, 0.6, 0.25);
      const vaneMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.85, roughness: 0.3 });
      const vane = new THREE.Mesh(vaneGeo, vaneMat);
      vane.position.set(0, Math.cos(angle) * 0.55, Math.sin(angle) * 0.55);
      vane.rotation.x = angle + 0.4;
      impellerGroup.add(vane);
    }
    impellerGroup.position.set(1.5, 0, 0);
    scene.add(impellerGroup);
    partsMap.set('impeller', impellerGroup);

    // --- Part I: Suction Inlet Pipe (DN100) ---
    const inletPipeGroup = new THREE.Group();
    inletPipeGroup.name = 'pipe_inlet';
    const inPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.4, 24), new THREE.MeshStandardMaterial({ color: 0x0d9488, metalness: 0.75, roughness: 0.4 }));
    inPipe.rotation.z = Math.PI / 2;
    inPipe.position.x = 0.7;
    inletPipeGroup.add(inPipe);

    const inFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.12, 24), new THREE.MeshStandardMaterial({ color: 0x115e59, metalness: 0.8, roughness: 0.3 }));
    inFlange.rotation.z = Math.PI / 2;
    inFlange.position.x = 1.4;
    inletPipeGroup.add(inFlange);

    inletPipeGroup.position.set(1.5, 0, 0);
    scene.add(inletPipeGroup);
    partsMap.set('pipe_inlet', inletPipeGroup);

    // --- Part J: Discharge Outlet Pipe (DN80) ---
    const outletPipeGroup = new THREE.Group();
    outletPipeGroup.name = 'pipe_outlet';
    const outPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.5, 24), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.75, roughness: 0.4 }));
    outPipe.position.y = 0.75;
    outletPipeGroup.add(outPipe);

    const outFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 24), new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.8, roughness: 0.3 }));
    outFlange.position.y = 1.5;
    outletPipeGroup.add(outFlange);

    outletPipeGroup.position.set(1.5, 0.9, 0);
    scene.add(outletPipeGroup);
    partsMap.set('pipe_outlet', outletPipeGroup);

    partsMapRef.current = partsMap;

    // 7. Flow Simulation Particles
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 1.5 + (Math.random() - 0.5) * 0.4;
      particlePositions[i * 3 + 1] = Math.random() * 2.2;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.08, transparent: true, opacity: 0.85 });
    const flowParticles = new THREE.Points(particleGeo, particleMat);
    flowParticles.visible = false;
    scene.add(flowParticles);
    flowParticlesRef.current = flowParticles;

    // 8. Event Listeners for Raycasting / Hover & Click Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Orbit camera if dragging
      if (isDraggingRef.current) {
        const deltaX = e.clientX - prevMousePosRef.current.x;
        const deltaY = e.clientY - prevMousePosRef.current.y;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };

        sphericalRef.current.theta -= deltaX * 0.008;
        sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.05, sphericalRef.current.phi - deltaY * 0.008));
        updateCameraPosition();
        return;
      }

      // Raycast hover check
      raycaster.setFromCamera(mouse, camera);
      const allMeshes: THREE.Mesh[] = [];
      partsMap.forEach(groupOrMesh => {
        if (groupOrMesh instanceof THREE.Mesh) allMeshes.push(groupOrMesh);
        else groupOrMesh.traverse(child => { if (child instanceof THREE.Mesh) allMeshes.push(child); });
      });

      const intersects = raycaster.intersectObjects(allMeshes);
      if (intersects.length > 0) {
        let rootObj: THREE.Object3D | null = intersects[0].object;
        while (rootObj && !rootObj.name && rootObj.parent) {
          rootObj = rootObj.parent;
        }
        if (rootObj && rootObj.name) {
          setHoveredPartName(rootObj.name);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredPartName(null);
        container.style.cursor = 'grab';
      }
    };

    const handlePointerUp = (e: MouseEvent) => {
      isDraggingRef.current = false;
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const allMeshes: THREE.Mesh[] = [];
      partsMap.forEach(groupOrMesh => {
        if (groupOrMesh instanceof THREE.Mesh) allMeshes.push(groupOrMesh);
        else groupOrMesh.traverse(child => { if (child instanceof THREE.Mesh) allMeshes.push(child); });
      });

      const intersects = raycaster.intersectObjects(allMeshes);
      if (intersects.length > 0) {
        let rootObj: THREE.Object3D | null = intersects[0].object;
        while (rootObj && !rootObj.name && rootObj.parent) {
          rootObj = rootObj.parent;
        }
        if (rootObj && rootObj.name) {
          const comp = machine.components.find(c => c.id === rootObj!.name || c.type === rootObj!.name);
          if (comp) {
            onSelectComponent(comp);
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius = Math.max(4.0, Math.min(22.0, sphericalRef.current.radius + e.deltaY * 0.01));
      updateCameraPosition();
    };

    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 9. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    });
    resizeObserver.observe(container);

    // 10. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (autoRotate) {
        sphericalRef.current.theta += delta * 0.35;
        updateCameraPosition();
      }

      // Rotate shaft & impeller when simulating
      if (isSimulating) {
        if (shaft) shaft.rotation.x += delta * 15;
        if (impellerGroup) impellerGroup.rotation.x += delta * 15;
      }

      // Animate fluid particles
      if (flowParticles && flowParticles.visible) {
        const positions = flowParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += delta * 2.2;
          if (positions[i * 3 + 1] > 2.4) {
            positions[i * 3 + 1] = 0;
            positions[i * 3] = 1.5 + (Math.random() - 0.5) * 0.35;
          }
        }
        flowParticles.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('wheel', handleWheel);
      renderer.dispose();
    };
  }, [machine.id]);

  function updateCameraPosition() {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x + targetRef.current.x, y + targetRef.current.y, z + targetRef.current.z);
    cameraRef.current.lookAt(targetRef.current);
  }

  // Update Exploded View positions smoothly
  useEffect(() => {
    const partsMap = partsMapRef.current;
    if (!partsMap) return;

    const explodeDist = explodedProgress * 1.8;

    const motor = partsMap.get('motor');
    if (motor) motor.position.x = -2.0 - explodeDist * 1.2;

    const bearingNDE = partsMap.get('bearing_nde');
    if (bearingNDE) bearingNDE.position.x = -3.0 - explodeDist * 1.5;

    const bearingDE = partsMap.get('bearing_de');
    if (bearingDE) bearingDE.position.x = -0.85 - explodeDist * 0.6;

    const coupling = partsMap.get('coupling');
    if (coupling) coupling.position.x = -0.25 - explodeDist * 0.2;

    const seal = partsMap.get('seal');
    if (seal) seal.position.x = 0.85 + explodeDist * 0.4;

    const casing = partsMap.get('casing');
    if (casing) casing.position.x = 1.5 + explodeDist * 0.9;

    const impeller = partsMap.get('impeller');
    if (impeller) impeller.position.x = 1.5 + explodeDist * 0.6;

    const inPipe = partsMap.get('pipe_inlet');
    if (inPipe) inPipe.position.x = 1.5 + explodeDist * 1.5;

    const outPipe = partsMap.get('pipe_outlet');
    if (outPipe) outPipe.position.y = 0.9 + explodeDist * 1.0;
  }, [explodedProgress]);

  // Update Visual View Modes (CAD, Thermal Gradient, Vibration Wave, Flow, X-Ray)
  useEffect(() => {
    const partsMap = partsMapRef.current;
    if (!partsMap) return;

    if (flowParticlesRef.current) {
      flowParticlesRef.current.visible = viewMode === 'flow';
    }

    partsMap.forEach((obj, key) => {
      const comp = machine.components.find(c => c.id === key || c.type === key);
      const isSelected = selectedComponent?.id === key || selectedComponent?.type === key;

      obj.traverse(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          const mat = child.material;

          // Highlight selection
          if (isSelected) {
            mat.emissive = new THREE.Color(0x38bdf8);
            mat.emissiveIntensity = 0.6;
          } else {
            mat.emissive = new THREE.Color(0x000000);
            mat.emissiveIntensity = 0;
          }

          if (viewMode === 'thermal') {
            // Thermal false-color map based on component temperature
            const temp = comp ? comp.temperature : 50;
            // Map 30°C (blue) to 90°C (red)
            const normTemp = Math.max(0, Math.min(1, (temp - 30) / 60));
            const heatColor = new THREE.Color().setHSL(0.66 * (1 - normTemp), 0.95, 0.45);
            mat.color = heatColor;
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.wireframe = false;
          } else if (viewMode === 'vibration') {
            // Color map based on vibration severity
            const vib = comp ? comp.vibration : 2.0;
            const normVib = Math.max(0, Math.min(1, (vib - 1.0) / 6.0));
            const vibColor = new THREE.Color().setHSL(0.35 * (1 - normVib), 0.9, 0.45);
            mat.color = vibColor;
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.wireframe = false;
          } else if (viewMode === 'xray') {
            mat.transparent = true;
            mat.opacity = 0.35;
            mat.wireframe = true;
          } else {
            // Normal CAD Mode
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.wireframe = false;
          }
        }
      });
    });
  }, [viewMode, selectedComponent, machine]);

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
      {/* 3D Canvas Viewport */}
      <div ref={containerRef} className="w-full flex-1 relative bg-gradient-to-b from-slate-950 via-[#060b17] to-slate-950" />

      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 mr-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-semibold text-cyan-400 font-mono">DIGITAL TWIN 3D</span>
          </div>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs font-mono text-slate-300">{machine.name}</span>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-800 shadow-xl">
          <button
            onClick={() => setViewMode('cad')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === 'cad' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            CAD Solid
          </button>
          <button
            onClick={() => setViewMode('thermal')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === 'thermal' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Thermal Gradient
          </button>
          <button
            onClick={() => setViewMode('vibration')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === 'vibration' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Vibration Stress
          </button>
          <button
            onClick={() => setViewMode('flow')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === 'flow' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            Hydrodynamics
          </button>
          <button
            onClick={() => setViewMode('xray')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === 'xray' ? 'bg-sky-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            X-Ray Wireframe
          </button>
        </div>
      </div>

      {/* Bottom Floating Control Bar (Exploded View slider, Auto-rotate, Zoom) */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Exploded View Control */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-3 shadow-xl">
          <span className="text-xs font-mono text-slate-300">EXPLODED VIEW</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodedProgress}
            onChange={(e) => setExplodedProgress(parseFloat(e.target.value))}
            className="w-32 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <span className="text-xs font-mono text-cyan-400 w-10">{Math.round(explodedProgress * 100)}%</span>
        </div>

        {/* Orbit & Tool Controls */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-800 shadow-xl">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Auto Rotate 360°"
            className={`p-1.5 rounded-md transition-colors ${autoRotate ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              sphericalRef.current.radius = Math.max(4.0, sphericalRef.current.radius - 1.5);
              updateCameraPosition();
            }}
            title="Zoom In"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sphericalRef.current.radius = Math.min(22.0, sphericalRef.current.radius + 1.5);
              updateCameraPosition();
            }}
            title="Zoom Out"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sphericalRef.current = { radius: 10.5, theta: Math.PI / 4, phi: Math.PI / 3.2 };
              updateCameraPosition();
            }}
            title="Reset Perspective"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredPartName && (
        <div className="absolute top-16 left-6 pointer-events-none bg-slate-900/95 border border-cyan-500/50 px-3 py-1.5 rounded-md shadow-2xl animate-fade-in">
          <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">Inspecting Component</div>
          <div className="text-xs font-semibold text-white capitalize">{hoveredPartName.replace('_', ' ')}</div>
        </div>
      )}
    </div>
  );
};
