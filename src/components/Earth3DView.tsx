import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { calculateHeatIndex } from '../utils/safetyRules';
import { safetyAudio } from '../utils/audio';
import {
  Globe,
  MapPin,
  Sun,
  Droplets,
  Wind,
  Flame,
  CheckCircle2,
  Navigation,
  Compass,
  RotateCw,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Layers,
  CloudSun,
  Moon,
  Mountain,
  Crosshair,
} from 'lucide-react';

interface SiteLocation {
  name: string;
  nameHi: string;
  country: string;
  lat: number;
  lng: number;
  baseTemp: number;
  baseRh: number;
  uvIndex: number;
  windSpeedKm: number;
  projectDescription: string;
}

const PRESET_LOCATIONS: SiteLocation[] = [
  {
    name: 'New Delhi / NCR Expressway',
    nameHi: 'नई दिल्ली / एनसीआर एक्सप्रेसवे',
    country: 'India',
    lat: 28.6139,
    lng: 77.209,
    baseTemp: 38.5,
    baseRh: 48,
    uvIndex: 9.4,
    windSpeedKm: 14,
    projectDescription: 'Central Vista & Urban Expressway expansion under intense northern plains summer.',
  },
  {
    name: 'Mumbai Coastal Road Project',
    nameHi: 'मुंबई कोस्टल रोड प्रोजेक्ट',
    country: 'India',
    lat: 19.076,
    lng: 72.8777,
    baseTemp: 33.2,
    baseRh: 78,
    uvIndex: 8.8,
    windSpeedKm: 22,
    projectDescription: 'Marine reclamation & tunnel ventilation under heavy maritime humidity heat stress.',
  },
  {
    name: 'Ahmedabad GIFT City Corridor',
    nameHi: 'अहमदाबाद गिफ्ट सिटी कॉरिडोर',
    country: 'India',
    lat: 23.0225,
    lng: 72.5714,
    baseTemp: 41.8,
    baseRh: 36,
    uvIndex: 10.2,
    windSpeedKm: 12,
    projectDescription: 'High-rise financial tower steel framing with ground radiation exceeding 48°C.',
  },
  {
    name: 'Chennai Metro Phase 2 Extension',
    nameHi: 'चेन्नई मेट्रो फेज़ 2',
    country: 'India',
    lat: 13.0827,
    lng: 80.2707,
    baseTemp: 36.4,
    baseRh: 72,
    uvIndex: 9.1,
    windSpeedKm: 18,
    projectDescription: 'Elevated viaduct casting and track laying under tropical solar radiation.',
  },
  {
    name: 'Kolkata Riverfront & Bridge Works',
    nameHi: 'कोलकाता रिवरफ्रंट प्रोजेक्ट',
    country: 'India',
    lat: 22.5726,
    lng: 88.3639,
    baseTemp: 35.8,
    baseRh: 76,
    uvIndex: 8.5,
    windSpeedKm: 15,
    projectDescription: 'Riverine humidity trap with heavy rebar steelwork on bridge piers.',
  },
  {
    name: 'Bengaluru Tech Park Infrastructure',
    nameHi: 'बेंगलुरु टेक पार्क इंफ्रास्ट्रक्चर',
    country: 'India',
    lat: 12.9716,
    lng: 77.5946,
    baseTemp: 30.5,
    baseRh: 55,
    uvIndex: 7.9,
    windSpeedKm: 16,
    projectDescription: 'Moderate plateau climate, UV protection and midday hydration monitoring.',
  },
  {
    name: 'Dubai South Construction District',
    nameHi: 'दुबई साउथ इंडस्ट्रियल डिस्ट्रिक्ट',
    country: 'UAE',
    lat: 25.2048,
    lng: 55.2708,
    baseTemp: 44.5,
    baseRh: 42,
    uvIndex: 11.0,
    windSpeedKm: 10,
    projectDescription: 'Arid desert conditions with strict mandatory midday outdoor work prohibition.',
  },
  {
    name: 'Singapore Deep Tunnel Sewerage',
    nameHi: 'सिंगापुर डीप टनल सीवरेज',
    country: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    baseTemp: 32.8,
    baseRh: 82,
    uvIndex: 8.2,
    windSpeedKm: 11,
    projectDescription: 'High wet bulb globe temperature (WBGT) requiring continuous hydration enforcement.',
  },
];

type EarthViewMode = 'satellite' | 'terrain' | 'night';

interface Earth3DViewProps {
  isHindi: boolean;
  onApplySiteLocation: (temp: number, rh: number, locName: string) => void;
}

export const Earth3DView: React.FC<Earth3DViewProps> = ({
  isHindi,
  onApplySiteLocation,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedLoc, setSelectedLoc] = useState<SiteLocation>(PRESET_LOCATIONS[0]);
  const [pinnedCoords, setPinnedCoords] = useState<{ lat: number; lng: number }>({
    lat: PRESET_LOCATIONS[0].lat,
    lng: PRESET_LOCATIONS[0].lng,
  });
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [appliedNotification, setAppliedNotification] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<EarthViewMode>('satellite');
  const [showClouds, setShowClouds] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(4.2);

  // References to communicate with Three.js scene
  const globePivotRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const pinMeshRef = useRef<THREE.Group | null>(null);
  const pingRingRef = useRef<THREE.Mesh | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const gridMeshRef = useRef<THREE.LineSegments | null>(null);
  const earthMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const texturesRef = useRef<{
    day: THREE.Texture | null;
    normal: THREE.Texture | null;
    specular: THREE.Texture | null;
    clouds: THREE.Texture | null;
    night: THREE.Texture | null;
  }>({ day: null, normal: null, specular: null, clouds: null, night: null });

  // Animation target rotation for smooth fly-to
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);

  // Calculate live localized heat index
  const localizedHeatIndex = calculateHeatIndex(selectedLoc.baseTemp, selectedLoc.baseRh);

  // Heat safety tier for this location
  const getSafetyTier = (hi: number) => {
    if (hi >= 42) {
      return {
        level: 'Danger / Extreme Heat',
        levelHi: 'अत्यधिक खतरा (हीटवेव)',
        color: '#dc2626',
        bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        workRest: '15 min work / 45 min shade rest',
        waterReq: '1.0 L / hour',
      };
    }
    if (hi >= 38) {
      return {
        level: 'High Caution / Severe Stress',
        levelHi: 'गंभीर चेतावनी (अति जोखिम)',
        color: '#d97706',
        bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        workRest: '30 min work / 30 min shade rest',
        waterReq: '0.9 L / hour',
      };
    }
    if (hi >= 32) {
      return {
        level: 'Moderate Caution',
        levelHi: 'मध्यम चेतावनी',
        color: '#d97706',
        bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        workRest: '45 min work / 15 min rest',
        waterReq: '0.75 L / hour',
      };
    }
    return {
      level: 'Safe / Nominal',
      levelHi: 'सामान्य व सुरक्षित',
      color: '#059669',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      workRest: '50 min work / 10 min rest',
      waterReq: '0.5 L / hour',
    };
  };

  const safetyTier = getSafetyTier(localizedHeatIndex);

  // Verified conversion: (lat, lng) -> 3D position matching Three.js SphereGeometry equirectangular UV mapping
  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(theta) * Math.sin(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Inverse conversion: 3D point on sphere -> (lat, lng)
  const vector3ToLatLng = (v: THREE.Vector3, radius: number): { lat: number; lng: number } => {
    const lat = 90 - (Math.acos(Math.max(-1, Math.min(1, v.y / radius))) * 180) / Math.PI;
    let theta = Math.atan2(v.z, -v.x);
    if (theta < 0) theta += Math.PI * 2;
    const lng = (theta * 180) / Math.PI - 180;
    return {
      lat: Number(lat.toFixed(2)),
      lng: Number(lng.toFixed(2)),
    };
  };

  // Calculate rotation needed to bring (lat, lng) to face the camera (+Z)
  const getRotationForLatLng = (lat: number, lng: number): { x: number; y: number } => {
    const theta = (lng + 180) * (Math.PI / 180);
    const rotY = -(theta - Math.PI / 2);
    const rotX = lat * (Math.PI / 180);
    return { x: rotX, y: rotY };
  };

  // Three.js Mount & Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 560;
    const height = 480;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, zoomLevel);
    cameraRef.current = camera;

    // 2. High Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting Setup (Sunlight + Ambient space reflection + Rim backlight)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    sunLight.position.set(5, 3.5, 4);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    // Deep space subtle star particles
    const starGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 40;
      starPos[i + 1] = (Math.random() - 0.5) * 40;
      starPos[i + 2] = -5 - Math.random() * 25;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.12,
      transparent: true,
      opacity: 0.65,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 4. Globe Pivot
    const globePivot = new THREE.Group();
    scene.add(globePivot);
    globePivotRef.current = globePivot;

    const globeRadius = 1.6;
    // High-resolution sphere mesh (64 segments for smooth 4K curvature)
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);

    // Load High-Res NASA Blue Marble Texture Layers
    const textureLoader = new THREE.TextureLoader();
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    const configureTexture = (tex: THREE.Texture, isColor = false) => {
      if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
    };

    const dayTexture = textureLoader.load('/textures/earth_day.jpg', (tex) => configureTexture(tex, true));
    const normalTexture = textureLoader.load('/textures/earth_normal.jpg', (tex) => configureTexture(tex, false));
    const specularTexture = textureLoader.load('/textures/earth_specular.jpg', (tex) => configureTexture(tex, false));
    const cloudsTexture = textureLoader.load('/textures/earth_clouds.png', (tex) => configureTexture(tex, false));
    const nightTexture = textureLoader.load('/textures/earth_night.jpg', (tex) => configureTexture(tex, true));

    texturesRef.current = {
      day: dayTexture,
      normal: normalTexture,
      specular: specularTexture,
      clouds: cloudsTexture,
      night: nightTexture,
    };

    // Photorealistic Earth Surface Material
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: dayTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.9, 0.9),
      roughnessMap: specularTexture,
      roughness: 0.6,
      metalness: 0.12,
    });
    earthMatRef.current = earthMaterial;

    const globeMesh = new THREE.Mesh(globeGeometry, earthMaterial);
    globePivot.add(globeMesh);

    // Atmospheric Cloud Layer Mesh (floating just above Earth surface)
    const cloudsGeometry = new THREE.SphereGeometry(globeRadius * 1.015, 54, 54);
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      roughness: 1.0,
      metalness: 0.0,
      depthWrite: false,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    cloudsMesh.visible = showClouds;
    globePivot.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    // Atmospheric Glow Shell (Rayleigh scattering edge)
    const atmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.035, 48, 48);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    // Subtle Lat/Long Coordinate Wireframe Grid
    const gridGeometry = new THREE.WireframeGeometry(new THREE.SphereGeometry(globeRadius * 1.003, 24, 12));
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.18,
    });
    const gridLines = new THREE.LineSegments(gridGeometry, gridMaterial);
    gridLines.visible = showGrid;
    globePivot.add(gridLines);
    gridMeshRef.current = gridLines;

    // 5. High-Precision Construction Hardhat Site Pin
    const pinGroup = new THREE.Group();

    // Golden Pin Mast
    const pinNeedleGeo = new THREE.CylinderGeometry(0.014, 0.004, 0.32, 16);
    pinNeedleGeo.translate(0, 0.16, 0);
    const pinNeedleMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2,
    });
    const pinNeedle = new THREE.Mesh(pinNeedleGeo, pinNeedleMat);
    pinGroup.add(pinNeedle);

    // High-Visibility Construction Hardhat Beacon Top
    const beaconGeo = new THREE.SphereGeometry(0.048, 20, 20);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.75,
      roughness: 0.25,
      metalness: 0.3,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 0.32, 0);
    pinGroup.add(beacon);

    // Animated Sonar Ping Ring on Ground
    const pingRingGeo = new THREE.RingGeometry(0.035, 0.08, 32);
    const pingRingMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const pingRing = new THREE.Mesh(pingRingGeo, pingRingMat);
    pingRing.rotation.x = Math.PI / 2;
    pinGroup.add(pingRing);
    pingRingRef.current = pingRing;

    globePivot.add(pinGroup);
    pinMeshRef.current = pinGroup;

    // Position initial pin
    const updatePinPosition = (lat: number, lng: number) => {
      const v = latLngToVector3(lat, lng, globeRadius);
      pinGroup.position.copy(v);
      pinGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize());
    };

    updatePinPosition(pinnedCoords.lat, pinnedCoords.lng);

    // Aim globe towards pinned coordinates initially
    const initRot = getRotationForLatLng(pinnedCoords.lat, pinnedCoords.lng);
    globePivot.rotation.x = initRot.x;
    globePivot.rotation.y = initRot.y;

    // 6. Interactive Raycasting, Drag & Mouse Wheel Zoom
    let isDragging = false;
    let dragDistance = 0;
    let previousMousePosition = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      dragDistance = 0;
      targetRotationRef.current = null; // Cancel any ongoing fly-to animation
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;
      dragDistance += Math.abs(deltaX) + Math.abs(deltaY);

      globePivot.rotation.y += deltaX * 0.005;
      globePivot.rotation.x = Math.max(-1.2, Math.min(1.2, globePivot.rotation.x + deltaY * 0.005));

      previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      isDragging = false;
    };

    // Smooth Zoom with Mouse Wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const newZoom = Math.max(2.1, Math.min(6.5, camera.position.z + e.deltaY * 0.004));
      camera.position.z = newZoom;
      setZoomLevel(Number(newZoom.toFixed(1)));
    };

    // Click on Earth surface to drop pin
    const onCanvasClick = (e: MouseEvent) => {
      // If user was dragging more than 5px, don't drop pin
      if (dragDistance > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(globeMesh);

      if (intersects.length > 0) {
        const hit = intersects[0];
        // Convert world hit point into globe local coordinate space
        const localPoint = globePivot.worldToLocal(hit.point.clone());
        const { lat, lng } = vector3ToLatLng(localPoint, globeRadius);

        safetyAudio.playClick();
        safetyAudio.playWearableBuzzer();

        setPinnedCoords({ lat, lng });
        updatePinPosition(lat, lng);

        // Smoothly center on clicked pin
        const targetRot = getRotationForLatLng(lat, lng);
        targetRotationRef.current = targetRot;

        // Estimated climate based on latitude & longitude
        const solarEquatorFactor = Math.cos((lat * Math.PI) / 180);
        const estimatedTemp = Number((24 + solarEquatorFactor * 16.5).toFixed(1));
        const estimatedRh = Math.round(Math.max(25, Math.min(88, 48 + Math.sin(lng * 0.04) * 28)));
        const estimatedUv = Number((6.0 + solarEquatorFactor * 5.2).toFixed(1));

        setSelectedLoc({
          name: `Custom Worksite (${lat > 0 ? `${lat}°N` : `${-lat}°S`}, ${lng > 0 ? `${lng}°E` : `${-lng}°W`})`,
          nameHi: `कस्टम निर्माण स्थल (${lat}°, ${lng}°)`,
          country: 'Geo-Coordinates',
          lat,
          lng,
          baseTemp: estimatedTemp,
          baseRh: estimatedRh,
          uvIndex: estimatedUv,
          windSpeedKm: Math.round(10 + Math.random() * 12),
          projectDescription: 'High-precision GPS coordinate placed on 4K satellite globe.',
        });
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onPointerDown);
    domEl.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domEl.addEventListener('click', onCanvasClick);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // Touch support
    domEl.addEventListener('touchstart', onPointerDown);
    domEl.addEventListener('touchmove', onPointerMove);
    window.addEventListener('touchend', onPointerUp);

    // 7. Render Animation Loop
    let animFrame = 0;
    let ringScale = 1;
    let ringOpacity = 0.85;

    const tick = () => {
      // Smooth fly-to interpolation when target rotation is set
      if (targetRotationRef.current && !isDragging) {
        const target = targetRotationRef.current;
        // Normalize rotation.y delta for shortest angular path
        let dy = target.y - globePivot.rotation.y;
        while (dy > Math.PI) dy -= Math.PI * 2;
        while (dy < -Math.PI) dy += Math.PI * 2;

        globePivot.rotation.y += dy * 0.08;
        globePivot.rotation.x += (target.x - globePivot.rotation.x) * 0.08;

        if (Math.abs(dy) < 0.002 && Math.abs(target.x - globePivot.rotation.x) < 0.002) {
          globePivot.rotation.y = target.y;
          globePivot.rotation.x = target.x;
          targetRotationRef.current = null;
        }
      } else if (isAutoRotating && !isDragging) {
        // Slow realistic planetary rotation
        globePivot.rotation.y += 0.0016;
      }

      // Dynamic Clouds rotation (drifts slightly faster than solid earth)
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0004;
      }

      // Animate golden sonar ping ring expanding on pin
      ringScale += 0.024;
      ringOpacity -= 0.016;
      if (ringScale > 2.8) {
        ringScale = 1;
        ringOpacity = 0.85;
      }
      if (pingRingRef.current) {
        pingRingRef.current.scale.set(ringScale, ringScale, 1);
        (pingRingRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, ringOpacity);
      }

      renderer.render(scene, camera);
      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrame);
      domEl.removeEventListener('mousedown', onPointerDown);
      domEl.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domEl.removeEventListener('click', onCanvasClick);
      domEl.removeEventListener('wheel', onWheel);
      domEl.removeEventListener('touchstart', onPointerDown);
      domEl.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      globeGeometry.dispose();
      earthMaterial.dispose();
      cloudsGeometry.dispose();
      cloudsMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      gridGeometry.dispose();
      gridMaterial.dispose();
      pinNeedleGeo.dispose();
      pinNeedleMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
      pingRingGeo.dispose();
      pingRingMat.dispose();
      starGeo.dispose();
      starMat.dispose();

      dayTexture.dispose();
      normalTexture.dispose();
      specularTexture.dispose();
      cloudsTexture.dispose();
      nightTexture.dispose();

      renderer.dispose();
    };
  }, [isAutoRotating]);

  // Handle Preset Location Click with Smooth Fly-To
  const handleSelectPreset = (loc: SiteLocation) => {
    safetyAudio.playClick();
    setSelectedLoc(loc);
    setPinnedCoords({ lat: loc.lat, lng: loc.lng });

    if (pinMeshRef.current) {
      const v = latLngToVector3(loc.lat, loc.lng, 1.6);
      pinMeshRef.current.position.copy(v);
      pinMeshRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize());
    }

    // Set smooth fly-to target rotation
    targetRotationRef.current = getRotationForLatLng(loc.lat, loc.lng);
  };

  // Switch View Mode (Satellite vs Terrain Relief vs Night Lights)
  const handleSetViewMode = (mode: EarthViewMode) => {
    safetyAudio.playClick();
    setViewMode(mode);
    const mat = earthMatRef.current;
    const tex = texturesRef.current;
    if (!mat || !tex) return;

    if (mode === 'satellite') {
      mat.map = tex.day;
      mat.normalMap = tex.normal;
      mat.normalScale = new THREE.Vector2(0.9, 0.9);
      mat.roughnessMap = tex.specular;
      mat.roughness = 0.6;
      mat.needsUpdate = true;
    } else if (mode === 'terrain') {
      mat.map = tex.day;
      mat.normalMap = tex.normal;
      mat.normalScale = new THREE.Vector2(2.5, 2.5); // Amplified 3D topographic relief
      mat.roughnessMap = null;
      mat.roughness = 0.85;
      mat.needsUpdate = true;
    } else if (mode === 'night') {
      mat.map = tex.night;
      mat.normalMap = tex.normal;
      mat.normalScale = new THREE.Vector2(0.4, 0.4);
      mat.roughnessMap = null;
      mat.roughness = 0.9;
      mat.needsUpdate = true;
    }
  };

  // Toggle Atmospheric Cloud Layer
  const handleToggleClouds = () => {
    safetyAudio.playClick();
    const next = !showClouds;
    setShowClouds(next);
    if (cloudsMeshRef.current) {
      cloudsMeshRef.current.visible = next;
    }
  };

  // Toggle Lat/Long Grid
  const handleToggleGrid = () => {
    safetyAudio.playClick();
    const next = !showGrid;
    setShowGrid(next);
    if (gridMeshRef.current) {
      gridMeshRef.current.visible = next;
    }
  };

  // Zoom In / Out Buttons
  const handleZoom = (delta: number) => {
    safetyAudio.playClick();
    if (!cameraRef.current) return;
    const newZoom = Math.max(2.1, Math.min(6.5, cameraRef.current.position.z + delta));
    cameraRef.current.position.z = newZoom;
    setZoomLevel(Number(newZoom.toFixed(1)));
  };

  // Center on pinned location
  const handleRecenter = () => {
    safetyAudio.playClick();
    targetRotationRef.current = getRotationForLatLng(pinnedCoords.lat, pinnedCoords.lng);
  };

  // Assign this location's weather to live monitoring dashboard
  const handleApplyToActiveSite = () => {
    safetyAudio.playBreakGranted();
    setAppliedNotification(true);
    onApplySiteLocation(selectedLoc.baseTemp, selectedLoc.baseRh, selectedLoc.name);
    setTimeout(() => setAppliedNotification(false), 2500);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="bg-[var(--card)] border border-[var(--bd)] rounded-xl p-4 md:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Globe className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-fraunces font-bold text-lg md:text-xl text-[var(--ink)] m-0 leading-tight">
                {isHindi ? '4K 3D अर्थ व कार्यस्थल पिन' : '4K 3D Earth & Construction Site Pin'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                NASA Blue Marble 4K
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] m-0 font-medium mt-0.5">
              {isHindi
                ? 'गूगल मैप्स स्तर की स्पष्टता के साथ 3D पृथ्वी पर किसी भी निर्माण स्थल को पिन करें और हीट स्ट्रेस जोखिम देखें'
                : 'Google Earth level clarity: Drag to orbit, wheel to zoom, click anywhere to pin site and inspect heat stress'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              safetyAudio.playClick();
              setIsAutoRotating(!isAutoRotating);
            }}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--bd)] rounded-lg text-xs font-semibold bg-[var(--soft)] text-[var(--ink)] hover:bg-[var(--bd)] transition-colors shadow-2xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'text-amber-500 animate-spin' : ''}`} />
            <span>{isAutoRotating ? 'Auto-Rotate: ON' : 'Orbit: Manual'}</span>
          </button>

          <button
            onClick={handleApplyToActiveSite}
            type="button"
            className="flex items-center gap-2 bg-[#0f172a] hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-900 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-amber-400 dark:text-slate-900" />
            <span>
              {appliedNotification
                ? isHindi ? 'साइट अपडेट हो गई!' : 'Site Conditions Synced!'
                : isHindi ? 'इस स्थान का मौसम लागू करें' : 'Set as Active Worksite Conditions'}
            </span>
          </button>
        </div>
      </div>

      {/* Main 3D World + Weather Dashboard Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* 3D Earth Globe Viewport (7 cols) */}
        <div className="lg:col-span-7 bg-[var(--card)] border border-[var(--bd)] rounded-xl p-4 shadow-xs flex flex-col justify-between relative overflow-hidden">
          {/* Top Bar with Map Layer Controls */}
          <div className="flex flex-wrap justify-between items-center pb-2.5 border-b border-[var(--bd)] gap-2 text-xs">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-[var(--soft)] p-0.5 rounded-lg border border-[var(--bd)]">
              <button
                onClick={() => handleSetViewMode('satellite')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  viewMode === 'satellite'
                    ? 'bg-[#0f172a] text-white dark:bg-amber-500 dark:text-slate-900 shadow-2xs'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
                title="Photorealistic Satellite View"
              >
                <Layers className="w-3 h-3" />
                <span>Satellite</span>
              </button>

              <button
                onClick={() => handleSetViewMode('terrain')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  viewMode === 'terrain'
                    ? 'bg-[#0f172a] text-white dark:bg-amber-500 dark:text-slate-900 shadow-2xs'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
                title="Topographic 3D Relief Terrain"
              >
                <Mountain className="w-3 h-3" />
                <span>3D Terrain</span>
              </button>

              <button
                onClick={() => handleSetViewMode('night')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  viewMode === 'night'
                    ? 'bg-[#0f172a] text-white dark:bg-amber-500 dark:text-slate-900 shadow-2xs'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
                title="City Night Lights"
              >
                <Moon className="w-3 h-3" />
                <span>Night Lights</span>
              </button>
            </div>

            {/* Coordinates & Layer Toggles */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleClouds}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1 transition-all ${
                  showClouds
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                    : 'bg-[var(--soft)] text-[var(--muted)] border-[var(--bd)]'
                }`}
                title="Toggle dynamic atmospheric cloud layer"
              >
                <CloudSun className="w-3 h-3" />
                <span>Clouds</span>
              </button>

              <button
                onClick={handleToggleGrid}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1 transition-all ${
                  showGrid
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    : 'bg-[var(--soft)] text-[var(--muted)] border-[var(--bd)]'
                }`}
                title="Toggle Lat/Long coordinate grid"
              >
                <Compass className="w-3 h-3" />
                <span>Grid</span>
              </button>

              <div className="text-[11px] font-mono-num font-bold text-[var(--muted)] pl-2 border-l border-[var(--bd)] hidden sm:flex items-center gap-2">
                <span>LAT: <b className="text-[var(--ink)]">{pinnedCoords.lat}°</b></span>
                <span>LNG: <b className="text-[var(--ink)]">{pinnedCoords.lng}°</b></span>
              </div>
            </div>
          </div>

          {/* 3D WebGL Canvas Mount Container */}
          <div className="relative my-2 flex items-center justify-center cursor-grab active:cursor-grabbing rounded-xl overflow-hidden bg-slate-950/90 shadow-inner">
            <div ref={mountRef} className="w-full h-[450px] flex items-center justify-center" />

            {/* Floating Zoom & Recenter Controls (Google Maps style) */}
            <div className="absolute right-3 bottom-3 flex flex-col gap-1.5 z-10">
              <button
                onClick={() => handleZoom(-0.6)}
                type="button"
                className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center shadow-md transition-all active:scale-95"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-amber-400" />
              </button>
              <button
                onClick={() => handleZoom(0.6)}
                type="button"
                className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center shadow-md transition-all active:scale-95"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-amber-400" />
              </button>
              <button
                onClick={handleRecenter}
                type="button"
                className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center shadow-md transition-all active:scale-95"
                title="Center on Pinned Worksite"
              >
                <Crosshair className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Instruction Floating Chip */}
            <div className="absolute bottom-3 left-3 bg-slate-900/85 text-white text-[11px] font-medium px-3 py-1.5 rounded-full border border-slate-700/80 backdrop-blur-xs flex items-center gap-1.5 shadow-md pointer-events-none select-none">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHindi ? 'ड्रैग करके घुमाएँ · पहिए से ज़ूम करें · क्लिक करके पिन लगाएँ' : 'Drag to rotate · Scroll to zoom · Click surface to drop site pin'}</span>
            </div>
          </div>

          {/* Quick Preset Construction Hubs Strip */}
          <div className="pt-2.5 border-t border-[var(--bd)]">
            <div className="text-[11px] font-bold text-[var(--muted)] mb-1.5 uppercase flex items-center justify-between">
              <span>{isHindi ? 'प्रमुख निर्माण गलियारे (क्लिक करें):' : 'Major Construction Corridors (Click to fly to):'}</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Instant Fly-To</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {PRESET_LOCATIONS.map((loc) => {
                const isSelected = selectedLoc.name === loc.name;
                return (
                  <button
                    key={loc.name}
                    onClick={() => handleSelectPreset(loc)}
                    type="button"
                    className={`px-2.5 py-1.5 text-xs rounded-lg font-semibold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-900 border-amber-400 shadow-xs'
                        : 'bg-[var(--soft)] text-[var(--ink)] border-[var(--bd)] hover:bg-[var(--bd)]'
                    }`}
                  >
                    {isHindi ? loc.nameHi.split(' ')[0] : loc.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Weather & Heat Risk Panel for Pinned Location (5 cols) */}
        <div className="lg:col-span-5 bg-[var(--card)] border border-[var(--bd)] rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            {/* Location Title & Geo Coordinates */}
            <div className="pb-3 border-b border-[var(--bd)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
                  PINNED WORKSITE TELEMETRY
                </span>
                <span className="text-[11px] font-mono-num font-bold px-2 py-0.5 rounded-full bg-[var(--soft)] text-[var(--ink)] border border-[var(--bd)]">
                  {selectedLoc.country}
                </span>
              </div>
              <h3 className="font-serif-fraunces font-bold text-xl text-[var(--ink)] m-0 leading-tight">
                {isHindi ? selectedLoc.nameHi : selectedLoc.name}
              </h3>
              <p className="text-xs text-[var(--muted)] m-0 mt-1 leading-relaxed">
                {selectedLoc.projectDescription}
              </p>
            </div>

            {/* Weather Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Air Temperature */}
              <div className="p-3 bg-[var(--soft)] rounded-xl border border-[var(--bd)]/70 text-center shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--muted)] font-semibold mb-0.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ambient Temperature</span>
                </div>
                <b className="font-mono-num font-bold text-2xl text-[var(--ink)]">
                  {selectedLoc.baseTemp.toFixed(1)}°
                </b>
                <span className="text-xs text-[var(--muted)] ml-0.5">C</span>
                <div className="text-[10px] text-[var(--muted)] font-mono-num mt-0.5">
                  ({((selectedLoc.baseTemp * 9) / 5 + 32).toFixed(1)}°F)
                </div>
              </div>

              {/* Relative Humidity */}
              <div className="p-3 bg-[var(--soft)] rounded-xl border border-[var(--bd)]/70 text-center shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--muted)] font-semibold mb-0.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Relative Humidity</span>
                </div>
                <b className="font-mono-num font-bold text-2xl text-[var(--ink)]">
                  {selectedLoc.baseRh}%
                </b>
                <div className="text-[10px] text-[var(--muted)] font-medium mt-0.5">
                  Dew Point: ~{Math.round(selectedLoc.baseTemp - (100 - selectedLoc.baseRh) / 5)}°C
                </div>
              </div>

              {/* Wind Speed */}
              <div className="p-3 bg-[var(--soft)] rounded-xl border border-[var(--bd)]/70 text-center shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--muted)] font-semibold mb-0.5">
                  <Wind className="w-3.5 h-3.5 text-slate-500" />
                  <span>Surface Wind</span>
                </div>
                <b className="font-mono-num font-bold text-xl text-[var(--ink)]">
                  {selectedLoc.windSpeedKm}
                </b>
                <span className="text-xs text-[var(--muted)] ml-0.5">km/h</span>
                <div className="text-[10px] text-[var(--muted)] font-medium mt-0.5">
                  Moderate Breeze
                </div>
              </div>

              {/* UV Radiation */}
              <div className="p-3 bg-[var(--soft)] rounded-xl border border-[var(--bd)]/70 text-center shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-[11px] text-[var(--muted)] font-semibold mb-0.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  <span>Solar UV Index</span>
                </div>
                <b className="font-mono-num font-bold text-xl text-rose-600 dark:text-rose-400">
                  UV {selectedLoc.uvIndex}
                </b>
                <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                  {selectedLoc.uvIndex >= 9 ? 'Extreme Radiation' : 'Very High Radiation'}
                </div>
              </div>
            </div>

            {/* Calculated Heat Index Banner */}
            <div className={`p-4 rounded-xl border ${safetyTier.bg} space-y-2 shadow-2xs`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 font-bold">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>{isHindi ? 'अनुमानित हीट इंडेक्स:' : 'Rothfusz Heat Index:'}</span>
                </div>
                <b className="font-mono-num text-2xl font-bold" style={{ color: safetyTier.color }}>
                  {localizedHeatIndex}°C
                </b>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-black/10 dark:border-white/10">
                <span className="font-semibold">{isHindi ? safetyTier.levelHi : safetyTier.level}</span>
                <span className="font-mono-num font-bold">{safetyTier.workRest}</span>
              </div>
            </div>

            {/* Occupational Directive Checklist */}
            <div className="space-y-1.5 text-xs">
              <b className="text-[var(--ink)] block text-xs">
                {isHindi ? 'कार्यस्थल सुरक्षा अनुपालन निर्देश:' : 'Site Medical & Shift Mandates:'}
              </b>
              <div className="flex items-center gap-2 text-[var(--muted)] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Water intake requirement: <b className="text-[var(--ink)] font-mono-num">{safetyTier.waterReq}</b></span>
              </div>
              <div className="flex items-center gap-2 text-[var(--muted)] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Direct unshaded exposure limit: <b className="text-[var(--ink)] font-mono-num">{safetyTier.workRest.split('/')[0]}</b></span>
              </div>
            </div>
          </div>

          {/* Quick Apply Action Button */}
          <button
            onClick={handleApplyToActiveSite}
            type="button"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            <span>
              {appliedNotification
                ? isHindi ? 'साइट अपडेट हो गई!' : 'Live Conditions Synced!'
                : isHindi ? 'इस स्थान का मौसम लाइव ग्रिड पर लागू करें' : 'Sync Live Dashboard to this Location'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
