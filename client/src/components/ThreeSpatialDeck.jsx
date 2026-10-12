import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeSpatialDeck({ selectedBayCode = 'A-12', className = '' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(20, 24, 28);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xd8a64a, 2.2);
    dirLight.position.set(15, 30, 20);
    scene.add(dirLight);

    const cyanLight = new THREE.PointLight(0x44e2b1, 2.4, 45);
    cyanLight.position.set(-15, 10, -10);
    scene.add(cyanLight);

    const group = new THREE.Group();
    scene.add(group);

    // Sleek Floor Grid Plane
    const gridHelper = new THREE.GridHelper(44, 22, 0xd8a64a, 0x1f2429);
    gridHelper.position.y = -0.05;
    group.add(gridHelper);

    // Dark floor slab
    const floorGeo = new THREE.PlaneGeometry(46, 46);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x0c0e10 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.1;
    group.add(floor);

    // Parking Bays
    const bayWidth = 3.6;
    const bayLength = 6.4;

    function createBay(x, z, labelText, isReserved, isSelected, isBike) {
      const bW = isBike ? 1.6 : bayWidth;
      const bL = isBike ? 3.0 : bayLength;

      // Bay outline wireframe
      const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(bW, 0.12, bL));
      const lineMat = new THREE.LineBasicMaterial({
        color: isSelected ? 0xffdf88 : isReserved ? 0xd8a64a : 0x2e353d,
        linewidth: isSelected ? 2 : 1
      });
      const wire = new THREE.LineSegments(edges, lineMat);
      wire.position.set(x, 0.06, z);
      group.add(wire);

      // Floor glow pad
      const padGeo = new THREE.PlaneGeometry(bW * 0.92, bL * 0.92);
      const padMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xd8a64a : isReserved ? 0x221a08 : 0x14181c,
        transparent: true,
        opacity: isSelected ? 0.45 : 0.4
      });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(x, 0.01, z);
      group.add(pad);

      // Vertical light beacon pillars at corners for selected bay
      if (isSelected) {
        const beaconGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.2, 8);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: 0xffe28a,
          transparent: true,
          opacity: 0.85
        });

        [
          [-bW / 2, -bL / 2],
          [bW / 2, -bL / 2],
          [-bW / 2, bL / 2],
          [bW / 2, bL / 2]
        ].forEach(([cx, cz]) => {
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.position.set(x + cx, 1.6, z + cz);
          group.add(beacon);
        });

        // Holographic ring
        const holoGeo = new THREE.RingGeometry(0.8, 1.2, 24);
        const holoMat = new THREE.MeshBasicMaterial({
          color: 0xd8a64a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75
        });
        const ring = new THREE.Mesh(holoGeo, holoMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, 3.4, z);
        group.add(ring);
      }
    }

    // Car rows (Row A)
    [-10, -5, 0, 5, 10].forEach((x, idx) => {
      const isSelected = idx === 2; // Bay A-12 active
      const isReserved = idx === 1 || idx === 3;
      createBay(x, -6, `A-0${idx + 1}`, isReserved, isSelected, false);
    });

    // Two-wheelers row (Row B)
    [-11, -8, -5, -2, 1, 4, 7, 10].forEach((x, idx) => {
      createBay(x, 5, `B-0${idx + 1}`, idx % 2 === 0, false, true);
    });

    // Minimalist Luxury Vehicle Hologram (At Bay A-12 center)
    const carGroup = new THREE.Group();
    carGroup.position.set(0, 0.35, -6);

    // Lower Chassis
    const chassisGeo = new THREE.BoxGeometry(2.4, 0.6, 5.0);
    const chassisMat = new THREE.MeshPhongMaterial({
      color: 0x171a1e,
      specular: 0xd8a64a,
      shininess: 90
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    carGroup.add(chassis);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(2.0, 0.55, 2.7);
    const cabinMat = new THREE.MeshPhongMaterial({
      color: 0x0b0d0f,
      specular: 0x44e2b1,
      shininess: 120,
      transparent: true,
      opacity: 0.85
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.52, -0.2);
    carGroup.add(cabin);

    // Headlights
    const lightStripGeo = new THREE.BoxGeometry(0.7, 0.08, 0.1);
    const lightStripMat = new THREE.MeshBasicMaterial({ color: 0xffdf88 });
    const hlLeft = new THREE.Mesh(lightStripGeo, lightStripMat);
    hlLeft.position.set(-0.85, 0.08, 2.5);
    const hlRight = new THREE.Mesh(lightStripGeo, lightStripMat);
    hlRight.position.set(0.85, 0.08, 2.5);
    carGroup.add(hlLeft);
    carGroup.add(hlRight);

    // Tail light
    const tlGeo = new THREE.BoxGeometry(2.2, 0.06, 0.1);
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
    const tailLight = new THREE.Mesh(tlGeo, tlMat);
    tailLight.position.set(0, 0.15, -2.5);
    carGroup.add(tailLight);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 16);
    const wheelMat = new THREE.MeshBasicMaterial({ color: 0x22262b });
    [
      [-1.25, 1.5],
      [1.25, 1.5],
      [-1.25, -1.5],
      [1.25, -1.5]
    ].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, -0.05, wz);
      carGroup.add(wheel);
    });

    group.add(carGroup);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    const onMouseMove = event => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotationY = mouseX * 0.4;
      targetRotationX = mouseY * 0.2;
    };

    container.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Floating rotation
      group.rotation.y += (targetRotationY - group.rotation.y) * 0.05 + 0.0018;
      group.rotation.x += (targetRotationX - group.rotation.x) * 0.05;

      const pulse = (Math.sin(elapsedTime * 2.8) + 1.0) * 0.5;
      cyanLight.intensity = 1.8 + pulse * 1.2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 600;
      height = container.clientHeight || 300;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedBayCode]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden ${className}`}
      title="Drag mouse over 3D deck to inspect bays and vehicle hologram"
    />
  );
}
