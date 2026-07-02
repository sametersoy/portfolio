import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  OrbitControls,
  Environment,
  ContactShadows,
  MeshReflectorMaterial,
  AdaptiveDpr,
} from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing'
import * as THREE from 'three'
import RackCabinet from './RackCabinet.jsx'
import { LAYOUT } from './rackLayout.js'

const FLOOR_Y = -LAYOUT.totalH / 2 - 0.2

// id -> world Y of each interactive unit, for camera focusing.
const UNIT_Y = Object.fromEntries(
  LAYOUT.slots.filter((s) => s.kind === 'unit').map((s) => [s.unit.id, s.yCenter]),
)

function CameraRig({ selectedId }) {
  const controls = useThree((s) => s.controls)
  const camPos = useRef(new THREE.Vector3(0.55, 0.1, 5.2))
  const target = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((state, delta) => {
    const y = selectedId != null ? UNIT_Y[selectedId] : null
    if (y != null) {
      camPos.current.set(0.6, y + 0.04, 2.5)
      target.current.set(-0.05, y, 0)
    } else {
      camPos.current.set(0.55, 0.1, 5.2)
      target.current.set(0, 0, 0)
    }
    const k = 1 - Math.pow(0.0015, delta) // frame-rate independent damping
    state.camera.position.lerp(camPos.current, k)
    if (controls) {
      controls.target.lerp(target.current, k)
      controls.update()
    }
  })
  return null
}

export default function Scene({ selectedId, onSelect }) {
  const dpr = useMemo(() => [1, Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1.5)], [])

  return (
    <Canvas
      shadows
      dpr={dpr}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ position: [0.55, 0.1, 5.2], fov: 38, near: 0.1, far: 50 }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={['#05080d']} />
      <fog attach="fog" args={['#05080d', 7.5, 16]} />

      {/* lighting */}
      <ambientLight intensity={0.28} color="#9fc4e0" />
      <spotLight
        position={[2.5, 4, 5]}
        angle={0.5}
        penumbra={0.8}
        intensity={120}
        distance={20}
        color="#dff1ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />
      <pointLight position={[-3, 1, 2]} intensity={14} color="#22e3a6" distance={12} />
      <pointLight position={[3, -1, 2]} intensity={12} color="#36c5ff" distance={12} />
      <pointLight position={[0, 2, -3]} intensity={16} color="#6e8cff" distance={14} />

      <Environment preset="warehouse" />

      <RackCabinet selectedId={selectedId} onSelect={onSelect} />

      {/* reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          resolution={1024}
          mixBlur={1}
          mixStrength={18}
          roughness={0.85}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#070b11"
          metalness={0.6}
          mirror={0.45}
        />
      </mesh>

      <ContactShadows
        position={[0, FLOOR_Y + 0.01, 0]}
        opacity={0.55}
        scale={8}
        blur={2.6}
        far={4}
        resolution={1024}
        color="#000000"
      />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.62}
        minAzimuthAngle={-Math.PI * 0.32}
        maxAzimuthAngle={Math.PI * 0.32}
        enableDamping
        dampingFactor={0.08}
      />
      <CameraRig selectedId={selectedId} />

      <EffectComposer multisampling={0} disableNormalPass>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.25} luminanceSmoothing={0.3} radius={0.7} />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
        <SMAA />
      </EffectComposer>

      <AdaptiveDpr pixelated />
    </Canvas>
  )
}
