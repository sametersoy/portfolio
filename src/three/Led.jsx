import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// A small emissive status LED that gently pulses (data-center "alive" feel).
export default function Led({
  position,
  color = '#22e3a6',
  size = 0.012,
  speed = 2,
  phase = 0,
  base = 0.6,
  swing = 0.5,
  steady = false,
}) {
  const mat = useRef()
  useFrame((state) => {
    if (!mat.current) return
    const t = state.clock.elapsedTime
    const i = steady
      ? base
      : base + swing * (0.5 + 0.5 * Math.sin(t * speed + phase))
    mat.current.emissiveIntensity = i * 3
  })
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshStandardMaterial
        ref={mat}
        color={color}
        emissive={color}
        emissiveIntensity={2}
        toneMapped={false}
        roughness={0.3}
      />
    </mesh>
  )
}

// Many blinking LEDs in a single instanced draw call. Each instance gets a
// pseudo-random phase/rate/duty so the bank flickers like real link traffic.
export function LedStrip({ positions, color = '#22e3a6', altColor = null, size = 0.005, speed = 5 }) {
  const ref = useRef()

  const data = useMemo(() => {
    const base = new THREE.Color(color)
    const alt = new THREE.Color(altColor || color)
    return positions.map((p, i) => ({
      pos: p,
      col: altColor && i % 4 === 1 ? alt : base,
      phase: (i * 2.399) % (Math.PI * 2), // golden-angle scatter
      rate: speed * (0.7 + ((i * 29) % 10) / 12),
      duty: 0.25 + ((i * 61) % 45) / 100,
    }))
  }, [positions, color, altColor, speed])

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    data.forEach((d, i) => {
      m.setPosition(d.pos[0], d.pos[1], d.pos[2])
      mesh.setMatrixAt(i, m)
      mesh.setColorAt(i, d.col)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [data])

  const tmp = useMemo(() => new THREE.Color(), [])

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    for (let i = 0; i < data.length; i++) {
      const d = data[i]
      // hard on/off blink reads as data traffic, not a sine glow
      const on = Math.sin(t * d.rate + d.phase) > d.duty * 2 - 1 ? 1 : 0.1
      tmp.copy(d.col).multiplyScalar(0.4 + on * 2.6)
      mesh.setColorAt(i, tmp)
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh key={positions.length} ref={ref} args={[null, null, positions.length]} frustumCulled={false}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}
