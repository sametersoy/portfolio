import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import {
  ServerFace,
  SwitchFace,
  BladeFace,
  StorageFace,
  FirewallFace,
} from './faces.jsx'

const FACES = {
  server: ServerFace,
  switch: SwitchFace,
  blade: BladeFace,
  storage: StorageFace,
  firewall: FirewallFace,
}

export default function RackUnit({ unit, y, w, h, depth, selected, dimmed, onSelect }) {
  const { t } = useTranslation()
  const group = useRef()
  const rim = useRef()
  const [hovered, setHovered] = useState(false)
  const Face = FACES[unit.type] || ServerFace

  // thin wireframe outline used as the hover/selection cue
  const outlineGeom = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(w + 0.11, h + 0.035, 0.06)),
    [w, h],
  )

  useFrame(() => {
    if (!group.current) return
    // Pull the active/hovered unit out of the rack like a drawer.
    const targetZ = selected ? 0.09 : hovered ? 0.04 : 0
    group.current.position.z += (targetZ - group.current.position.z) * 0.15
    if (rim.current) {
      const target = selected ? 0.9 : hovered ? 0.45 : 0
      rim.current.material.opacity += (target - rim.current.material.opacity) * 0.15
    }
  })

  const setCursor = (on) => {
    document.body.style.cursor = on ? 'pointer' : 'auto'
  }

  return (
    <group position={[0, y, 0]}>
      <group
        ref={group}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          setCursor(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          setCursor(false)
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(unit)
        }}
      >
        {/* chassis body behind the face */}
        <mesh position={[0, 0, -depth / 2 - 0.02]} castShadow receiveShadow>
          <boxGeometry args={[w, h, depth]} />
          <meshStandardMaterial color="#0a1119" metalness={0.7} roughness={0.55} />
        </mesh>

        {/* selection / hover outline */}
        <lineSegments ref={rim} geometry={outlineGeom} position={[0, 0, 0.03]} raycast={() => null}>
          <lineBasicMaterial color={unit.accent} transparent opacity={0} depthWrite={false} />
        </lineSegments>

        <Face w={w} h={h} unit={unit} />

        {(hovered || selected) && (
          <Html
            position={[w / 2 + 0.12, 0, 0.1]}
            center
            distanceFactor={5.5}
            occlude={false}
            style={{ pointerEvents: 'none' }}
          >
            <div className="unit-tag" style={{ '--accent': unit.accent }}>
              <span className="unit-tag__icon">{unit.icon}</span>
              <span className="unit-tag__title">{t(`units.${unit.id}.title`)}</span>
            </div>
          </Html>
        )}
      </group>

      {/* dim overlay when another unit is selected */}
      {dimmed && (
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[w + 0.02, h + 0.005, 0.01]} />
          <meshBasicMaterial color="#04070b" transparent opacity={0.55} depthWrite={false} />
        </mesh>
      )}
    </group>
  )
}
