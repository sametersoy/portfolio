import { useMemo } from 'react'
import * as THREE from 'three'

// Colored patch cords running from a device's ports up into the cable
// management panel above it, laced behind the D-rings and off to the side.
// Deterministic pseudo-random slack so every load looks identical.

const COLORS = ['#d94a38', '#36a3e0', '#e8c15a', '#1fbf8f', '#a86fd6', '#dfe5ea', '#e0803c', '#4a6fd9']

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const noRaycast = () => null

export default function PatchCables({ fromY, panelY, count = 6, w }) {
  const cables = useMemo(() => {
    const rand = rng(Math.round(Math.abs(fromY) * 10007) + count * 7919)
    const ringXs = [-0.4, -0.2, 0, 0.2, 0.4].map((f) => f * w)
    return Array.from({ length: count }).map((_, i) => {
      const color = COLORS[i % COLORS.length]
      const portX = -w * 0.3 + (i / Math.max(1, count - 1)) * w * 0.48 + (rand() - 0.5) * 0.02
      const ringX = ringXs[Math.min(ringXs.length - 1, Math.floor((i / count) * ringXs.length))]
      const dir = ringX > 0 || (ringX === 0 && i % 2) ? 1 : -1
      const midY = (fromY + panelY) / 2

      const pts = [
        new THREE.Vector3(portX, fromY - 0.004, 0.055),
        // slack bulge out of the rack face
        new THREE.Vector3(portX + (rand() - 0.5) * 0.07, midY, 0.125 + rand() * 0.05),
        // swing under the ring, then tuck behind it
        new THREE.Vector3(ringX, panelY - 0.038, 0.095),
        new THREE.Vector3(ringX + dir * 0.12, panelY, 0.062),
        // run off into the side of the cabinet
        new THREE.Vector3(dir * w * 0.53, panelY + 0.015, 0.015),
      ]
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.55)
      const geometry = new THREE.TubeGeometry(curve, 48, 0.0078, 7, false)
      return { geometry, color, portX }
    })
  }, [fromY, panelY, count, w])

  return (
    <group>
      {cables.map((c, i) => (
        <group key={i}>
          <mesh geometry={c.geometry} raycast={noRaycast} castShadow>
            <meshStandardMaterial color={c.color} metalness={0.05} roughness={0.62} />
          </mesh>
          {/* connector boot at the port */}
          <mesh position={[c.portX, fromY + 0.008, 0.052]} raycast={noRaycast}>
            <boxGeometry args={[0.015, 0.026, 0.018]} />
            <meshStandardMaterial color={c.color} roughness={0.5} metalness={0.05} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
