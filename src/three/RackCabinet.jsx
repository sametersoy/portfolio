import RackUnit from './RackUnit.jsx'
import { VentPanel, BlankPanel, PduPanel, PsuPanel } from './faces.jsx'
import { LAYOUT, U, INNER_W, UNIT_W, BODY_DEPTH } from './rackLayout.js'
import { hexPerfTexture, brushedTexture, railTexture, labelTexture } from './textures.js'

const PANELS = {
  vent: VentPanel,
  blank: BlankPanel,
  pdu: PduPanel,
  psu: PsuPanel,
}

function Frame({ totalH }) {
  const h = totalH + 0.34 // top + bottom margins
  const w = INNER_W + 0.22
  const d = BODY_DEPTH + 0.2
  const post = 0.07
  const totalU = Math.round(totalH / U)
  const rough = brushedTexture()
  const brand = labelTexture('SAMETERSOY.COM', { color: '#22e3a6', bg: '#041210', glow: '#22e3a6', w: 512, h: 64 })

  return (
    <group>
      {/* four corner posts */}
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (w / 2 - post / 2), 0, sz * (d / 2 - post / 2)]} castShadow receiveShadow>
          <boxGeometry args={[post, h, post]} />
          <meshStandardMaterial color="#151d26" metalness={0.85} roughness={0.55} roughnessMap={rough} />
        </mesh>
      ))}

      {/* top cap with vent + rear brush slot */}
      <mesh position={[0, h / 2 - post / 2, 0]} castShadow>
        <boxGeometry args={[w, post, d]} />
        <meshStandardMaterial color="#10161e" metalness={0.8} roughness={0.5} roughnessMap={rough} />
      </mesh>
      <mesh position={[0, h / 2 + 0.001, d * 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.62, d * 0.5]} />
        <meshStandardMaterial map={hexPerfTexture(8, 5, '#0e151d')} metalness={0.6} roughness={0.7} />
      </mesh>
      <mesh position={[0, h / 2 + 0.001, -d * 0.34]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.5, 0.08]} />
        <meshBasicMaterial color="#05080c" />
      </mesh>

      {/* base plinth + leveling feet */}
      <mesh position={[0, -h / 2 + 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.12, d]} />
        <meshStandardMaterial color="#0c121a" metalness={0.8} roughness={0.5} roughnessMap={rough} />
      </mesh>
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (w / 2 - 0.1), -h / 2 - 0.015, sz * (d / 2 - 0.12)]}>
          <cylinderGeometry args={[0.019, 0.027, 0.032, 14]} />
          <meshStandardMaterial color="#161c24" metalness={0.7} roughness={0.5} />
        </mesh>
      ))}

      {/* side panels with vent slits */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 - 0.012), 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.024, h - post * 2, d - post * 2]} />
            <meshStandardMaterial color="#0d141d" metalness={0.75} roughness={0.55} roughnessMap={rough} />
          </mesh>
          {[0.32, 0, -0.32].map((f) => (
            <mesh key={f} position={[s * 0.0125, f * h, 0]} rotation={[0, (s * Math.PI) / 2, 0]}>
              <planeGeometry args={[d * 0.58, 0.09]} />
              <meshStandardMaterial map={hexPerfTexture(6, 1, '#0a1119')} metalness={0.6} roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      {/* perforated rear mesh door + latch */}
      <mesh position={[0, 0, -d / 2 + 0.012]} receiveShadow>
        <planeGeometry args={[w - post * 2, h - post * 2]} />
        <meshStandardMaterial map={hexPerfTexture(9, 22, '#0a1017')} metalness={0.6} roughness={0.65} side={2} />
      </mesh>
      <mesh position={[w * 0.38, 0, -d / 2 + 0.028]}>
        <boxGeometry args={[0.035, 0.13, 0.03]} />
        <meshStandardMaterial color="#1b242e" metalness={0.85} roughness={0.45} />
      </mesh>

      {/* front EIA rails: square cage-nut holes + U numbers */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (INNER_W / 2 + 0.014), 0, d / 2 - 0.0935]}>
          <mesh castShadow>
            <boxGeometry args={[0.036, totalH, 0.045]} />
            <meshStandardMaterial color="#232c36" metalness={0.9} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0, 0.0235]}>
            <planeGeometry args={[0.036, totalH]} />
            <meshStandardMaterial map={railTexture(totalU)} metalness={0.85} roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* rear rails */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (INNER_W / 2 + 0.014), 0, -d / 2 + 0.12]} castShadow>
          <boxGeometry args={[0.036, totalH, 0.045]} />
          <meshStandardMaterial color="#1c242e" metalness={0.85} roughness={0.5} />
        </mesh>
      ))}

      {/* glowing name plate on the top cap */}
      <mesh position={[0, h / 2 - post / 2, d / 2 + 0.002]}>
        <planeGeometry args={[0.62, 0.062]} />
        <meshStandardMaterial
          map={brand}
          emissiveMap={brand}
          emissive="#ffffff"
          emissiveIntensity={0.6}
          toneMapped={false}
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>

      {/* faint interior glow bleeding through the rear mesh */}
      <pointLight position={[0, 0, -0.1]} intensity={2} distance={2.2} color="#17c592" />
    </group>
  )
}

export default function RackCabinet({ selectedId, onSelect }) {
  const { slots, totalH } = LAYOUT
  const faceZ = BODY_DEPTH / 2 + 0.1 // front mounting plane

  return (
    <group>
      <Frame totalH={totalH} />

      {/* mounted devices on the front plane */}
      <group position={[0, 0, faceZ - 0.05]}>
        {slots.map((s, i) => {
          if (s.kind === 'unit') {
            return (
              <RackUnit
                key={s.unit.id}
                unit={s.unit}
                y={s.yCenter}
                w={UNIT_W}
                h={s.h}
                depth={BODY_DEPTH}
                selected={selectedId === s.unit.id}
                dimmed={selectedId && selectedId !== s.unit.id}
                onSelect={onSelect}
              />
            )
          }
          const Panel = PANELS[s.kind]
          return (
            <group key={`${s.kind}-${i}`} position={[0, s.yCenter, 0]}>
              <mesh position={[0, 0, -BODY_DEPTH / 2 - 0.02]}>
                <boxGeometry args={[UNIT_W, s.h, BODY_DEPTH * 0.5]} />
                <meshStandardMaterial color="#0a1119" metalness={0.6} roughness={0.6} />
              </mesh>
              <Panel w={UNIT_W} h={s.h} />
            </group>
          )
        })}
      </group>
    </group>
  )
}
