import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import Led, { LedStrip } from './Led.jsx'
import {
  hexPerfTexture,
  brushedTexture,
  labelTexture,
  rj45Texture,
  outletsTexture,
  meterTexture,
  screwTexture,
  caddyTexture,
} from './textures.js'

// Front-detail plane: all detailing sits just in front of the plate surface.
const FZ = 0.027

// ---- shared materials / primitives ---------------------------------------

function BrushedMaterial({ color = '#101923', metalness = 0.85, roughness = 0.8, ...rest }) {
  const tex = brushedTexture()
  return (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      roughnessMap={tex}
      bumpMap={tex}
      bumpScale={0.0015}
      {...rest}
    />
  )
}

function Screw({ position, r = 0.0095 }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[r, r * 0.9, 0.012, 16]} />
      <meshStandardMaterial map={screwTexture()} color="#ffffff" metalness={0.9} roughness={0.35} />
    </mesh>
  )
}

// Rack-mount ears bolted to the rails — every faceplate gets a pair.
function Ears({ w, h }) {
  const sy = h / 2 - Math.min(0.035, h * 0.24)
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 + 0.022), 0, -0.006]}>
          <RoundedBox args={[0.05, h * 0.98, 0.014]} radius={0.004} smoothness={2} castShadow>
            <BrushedMaterial color="#0d141c" />
          </RoundedBox>
          <Screw position={[0, sy, 0.012]} />
          <Screw position={[0, -sy, 0.012]} />
        </group>
      ))}
    </group>
  )
}

function Plate({ w, h, color = '#101923' }) {
  return (
    <group>
      <RoundedBox args={[w, h, 0.05]} radius={0.008} smoothness={3} castShadow receiveShadow>
        <BrushedMaterial color={color} />
      </RoundedBox>
      <Ears w={w} h={h} />
    </group>
  )
}

// Hex-perforated ventilation area.
function VentHex({ w, h, x = 0, y = 0, z = FZ - 0.012, bg = '#0e151d' }) {
  const tex = hexPerfTexture(Math.max(1, Math.round(w * 8)), Math.max(1, Math.round(h * 8)), bg)
  return (
    <mesh position={[x, y, z]}>
      <boxGeometry args={[w, h, 0.008]} />
      <meshStandardMaterial map={tex} metalness={0.6} roughness={0.7} />
    </mesh>
  )
}

// Hot-swap drive sled: textured face (perforation, label, latch recess),
// protruding release handle, light-pipe LEDs added by the parent face.
function DriveBay({ x, y, w, h }) {
  return (
    <group position={[x, y, FZ]}>
      <mesh castShadow>
        <boxGeometry args={[w, h, 0.022]} />
        <BrushedMaterial color="#1a232d" />
      </mesh>
      <mesh position={[0, 0, 0.0115]}>
        <planeGeometry args={[w * 0.97, h * 0.94]} />
        <meshStandardMaterial map={caddyTexture()} metalness={0.55} roughness={0.6} />
      </mesh>
      {/* release handle sticks out slightly */}
      <mesh position={[-w * 0.09, -h * 0.3, 0.016]} castShadow>
        <boxGeometry args={[w * 0.6, h * 0.13, 0.007]} />
        <BrushedMaterial color="#2b3644" />
      </mesh>
    </group>
  )
}

// Spinning 7-blade cooling fan behind a wire finger guard.
function Fan({ x = 0, y = 0, r = 0.055, speed = 11 }) {
  const blades = useRef()
  useFrame((_, dt) => {
    if (blades.current) blades.current.rotation.z -= dt * speed
  })
  return (
    <group position={[x, y, FZ]}>
      <mesh position={[0, 0, -0.006]}>
        <circleGeometry args={[r * 1.05, 24]} />
        <meshStandardMaterial color="#020509" metalness={0.3} roughness={0.9} />
      </mesh>
      <group ref={blades} position={[0, 0, -0.001]}>
        {Array.from({ length: 7 }).map((_, i) => (
          <group key={i} rotation={[0, 0, (i / 7) * Math.PI * 2]}>
            <mesh position={[r * 0.55, 0, 0]} rotation={[0, 0.55, 0]}>
              <boxGeometry args={[r * 0.85, r * 0.36, 0.003]} />
              <meshStandardMaterial color="#1b232d" metalness={0.4} roughness={0.7} />
            </mesh>
          </group>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[r * 0.3, r * 0.3, 0.012, 16]} />
          <meshStandardMaterial color="#0d141c" metalness={0.5} roughness={0.6} />
        </mesh>
      </group>
      {/* wire finger guard */}
      {[0.42, 0.72, 0.99].map((f) => (
        <mesh key={f} position={[0, 0, 0.008]}>
          <torusGeometry args={[r * f, 0.0018, 6, 28]} />
          <meshStandardMaterial color="#7d8894" metalness={0.9} roughness={0.35} />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0, 0.007]} rotation={[0, 0, (i / 4) * Math.PI * 2 + Math.PI / 4]}>
          <boxGeometry args={[r * 2, 0.0032, 0.0025]} />
          <meshStandardMaterial color="#7d8894" metalness={0.9} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}

// ---- device faces --------------------------------------------------------

export function ServerFace({ w, h, unit }) {
  const rows = h > 0.2 ? 2 : 1
  const cols = 6
  const areaW = w * 0.82
  const areaX0 = -w * 0.475
  const cellW = areaW / cols
  const cellH = (h * 0.9) / rows

  const { bays, actLeds, statLeds } = useMemo(() => {
    const b = []
    const act = []
    const stat = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = areaX0 + cellW * (c + 0.5)
        const y = rows === 1 ? 0 : (r === 0 ? 1 : -1) * cellH * 0.51
        b.push({ x, y })
        act.push([x + cellW * 0.325, y + cellH * 0.17, FZ + 0.016])
        stat.push([x + cellW * 0.325, y - cellH * 0.02, FZ + 0.016])
      }
    }
    return { bays: b, actLeds: act, statLeds: stat }
  }, [w, h])

  return (
    <group>
      <Plate w={w} h={h} color="#10181f" />

      {/* thin chassis lip top & bottom */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, s * (h / 2 - 0.007), FZ - 0.004]}>
          <boxGeometry args={[w * 0.995, 0.011, 0.012]} />
          <BrushedMaterial color="#0b1117" />
        </mesh>
      ))}

      {/* front loaded with hot-swap sleds, like a real 2U */}
      {bays.map((b, i) => (
        <DriveBay key={i} x={b.x} y={b.y} w={cellW * 0.965} h={cellH * 0.94} />
      ))}
      <LedStrip positions={actLeds} color="#22e3a6" size={0.0036} speed={7} />
      <LedStrip positions={statLeds} color="#36c5ff" size={0.0032} speed={1.2} />

      {/* service column on the right: power, USB/VGA, vent */}
      <group position={[w * 0.435, 0, 0]}>
        <group position={[0, h * 0.32, FZ]}>
          <mesh>
            <torusGeometry args={[0.0125, 0.003, 8, 20]} />
            <BrushedMaterial color="#2b3644" />
          </mesh>
          <Led position={[0, 0, 0.002]} color={unit.led} size={0.007} steady base={0.85} />
        </group>
        <Led position={[0, h * 0.17, FZ + 0.004]} color="#36c5ff" size={0.0042} phase={1.3} speed={3.5} />
        {/* USB + VGA */}
        <mesh position={[0, h * 0.04, FZ]}>
          <boxGeometry args={[0.03, 0.012, 0.01]} />
          <meshStandardMaterial color="#04080d" metalness={0.5} roughness={0.7} />
        </mesh>
        <mesh position={[0, -h * 0.08, FZ]}>
          <boxGeometry args={[0.038, 0.015, 0.01]} />
          <meshStandardMaterial color="#0a1b3a" metalness={0.4} roughness={0.65} />
        </mesh>
        <VentHex w={w * 0.09} h={h * 0.42} y={-h * 0.29} />
      </group>

      {/* pull-out service tag (blue tab) */}
      <mesh position={[-w * 0.45, -h / 2 + 0.013, FZ + 0.006]}>
        <boxGeometry args={[0.034, 0.013, 0.006]} />
        <meshStandardMaterial color="#2f6fd8" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  )
}

export function SwitchFace({ w, h, unit }) {
  // 2U 48-port core switch: two rows of 2×12 port blocks + SFP+ quad
  const blockW = w * 0.26
  const blocksX = [-w * 0.115, w * 0.16]
  const rowsY = [h * 0.22, -h * 0.24]
  const portH = h * 0.34

  const ledPos = useMemo(() => {
    const arr = []
    for (const ry of rowsY) {
      for (const bx of blocksX) {
        for (let i = 0; i < 12; i++) {
          arr.push([bx - blockW / 2 + (blockW * (i + 0.5)) / 12, ry + portH * 0.62, FZ + 0.012])
        }
      }
    }
    return arr
  }, [w, h])

  return (
    <group>
      <Plate w={w} h={h} color="#0f1c27" />

      {/* brand + console / mgmt column */}
      <mesh position={[-w * 0.385, h * 0.26, FZ - 0.004]}>
        <boxGeometry args={[w * 0.16, h * 0.3, 0.008]} />
        <meshStandardMaterial map={labelTexture('SE-CORE 48G', { sub: 'MANAGED L3' })} metalness={0.3} roughness={0.6} />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} position={[-w * 0.42 + i * 0.07, -h * 0.05, FZ]}>
          <boxGeometry args={[0.05, h * 0.18, 0.012]} />
          <meshStandardMaterial color="#04080d" metalness={0.5} roughness={0.7} />
        </mesh>
      ))}
      {/* SYS / FAN / PWR status */}
      <Led position={[-w * 0.44, -h * 0.3, FZ + 0.004]} color={unit.led} size={0.0055} steady base={0.9} />
      <Led position={[-w * 0.4, -h * 0.3, FZ + 0.004]} color="#22e3a6" size={0.0055} phase={1} speed={2} />
      <Led position={[-w * 0.36, -h * 0.3, FZ + 0.004]} color="#ffb454" size={0.0055} phase={2} speed={3} />

      {/* port field: 4 blocks of 12 = 48 ports */}
      {rowsY.map((ry) =>
        blocksX.map((bx) => (
          <mesh key={`${ry}-${bx}`} position={[bx, ry, FZ - 0.002]}>
            <boxGeometry args={[blockW, portH, 0.014]} />
            <meshStandardMaterial map={rj45Texture(12)} metalness={0.5} roughness={0.6} />
          </mesh>
        )),
      )}
      <LedStrip positions={ledPos} color={unit.led} altColor="#ffb454" size={0.0038} speed={7} />

      {/* SFP+ uplink quad (2×2) */}
      {[0, 1].map((col) =>
        [0, 1].map((row) => (
          <group key={`${col}-${row}`} position={[w * 0.36 + col * 0.08, h * 0.13 - row * h * 0.3, FZ]}>
            <mesh castShadow>
              <boxGeometry args={[0.068, h * 0.22, 0.018]} />
              <BrushedMaterial color="#232e39" />
            </mesh>
            <mesh position={[0, 0, 0.01]}>
              <boxGeometry args={[0.054, h * 0.12, 0.004]} />
              <meshStandardMaterial color="#03060a" roughness={0.8} metalness={0.4} />
            </mesh>
          </group>
        )),
      )}
      <VentHex w={w * 0.055} h={h * 0.72} x={w * 0.465} />
    </group>
  )
}

export function BladeFace({ w, h, unit }) {
  const blades = 8
  const areaW = w * 0.88
  const stepX = areaW / blades
  const startX = -areaW / 2

  const ledPos = useMemo(
    () =>
      Array.from({ length: blades * 2 }, (_, k) => {
        const i = Math.floor(k / 2)
        const x = startX + stepX * (i + 0.5)
        return [x + (k % 2 ? 0.016 : -0.016), -h * 0.33, FZ + 0.026]
      }),
    [w, h],
  )

  return (
    <group>
      <Plate w={w} h={h} color="#131b2c" />
      {Array.from({ length: blades }).map((_, i) => {
        const x = startX + stepX * (i + 0.5)
        return (
          <group key={i} position={[x, 0, FZ]}>
            <RoundedBox args={[stepX * 0.82, h * 0.84, 0.034]} radius={0.004} smoothness={2} castShadow>
              <BrushedMaterial color="#1c2942" />
            </RoundedBox>
            <mesh position={[0, h * 0.07, 0.019]}>
              <boxGeometry args={[stepX * 0.64, h * 0.5, 0.004]} />
              <meshStandardMaterial map={hexPerfTexture(1, 2, '#141f33')} metalness={0.5} roughness={0.7} />
            </mesh>
            {/* release latch */}
            <mesh position={[0, h * 0.36, 0.02]}>
              <boxGeometry args={[stepX * 0.58, 0.015, 0.014]} />
              <BrushedMaterial color="#33415c" />
            </mesh>
          </group>
        )
      })}
      <LedStrip positions={ledPos} color={unit.led} altColor="#22e3a6" size={0.0048} speed={4} />
    </group>
  )
}

export function StorageFace({ w, h, unit }) {
  const cols = 6
  const rows = 2
  const areaW = w * 0.78
  const cellW = areaW / cols
  const cellH = (h * 0.86) / rows

  const { cells, ledPos } = useMemo(() => {
    const c = []
    const l = []
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const x = -w * 0.485 + cellW * (col + 0.5)
        const y = (r === 0 ? 1 : -1) * cellH * 0.53
        c.push({ x, y })
        l.push([x + cellW * 0.33, y - cellH * 0.26, FZ + 0.014])
      }
    }
    return { cells: c, ledPos: l }
  }, [w, h])

  return (
    <group>
      <Plate w={w} h={h} color="#171a1a" />
      {cells.map((c, i) => (
        <DriveBay key={i} x={c.x} y={c.y} w={cellW * 0.92} h={cellH * 0.88} />
      ))}
      <LedStrip positions={ledPos} color={unit.led} altColor="#ff5d73" size={0.0042} speed={6} />

      {/* controller column */}
      <mesh position={[w * 0.415, h * 0.27, FZ - 0.004]}>
        <boxGeometry args={[w * 0.12, h * 0.26, 0.01]} />
        <meshStandardMaterial map={labelTexture('SE-SAN 24', { sub: 'DUAL CTRL' })} metalness={0.3} roughness={0.6} />
      </mesh>
      <Led position={[w * 0.39, h * 0.02, FZ + 0.004]} color={unit.led} size={0.0055} steady base={0.85} />
      <Led position={[w * 0.44, h * 0.02, FZ + 0.004]} color="#22e3a6" size={0.0055} phase={0.8} speed={3} />
      <VentHex w={w * 0.12} h={h * 0.38} x={w * 0.415} y={-h * 0.24} />
    </group>
  )
}

export function FirewallFace({ w, h, unit }) {
  // 2U next-gen firewall appliance: glossy brand fascia + dual port rows
  const blockW = w * 0.28
  const blockX = w * 0.06
  const ledPos = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => [
        blockX - blockW / 2 + (blockW * (i + 0.5)) / 8,
        h * 0.22 + h * 0.21,
        FZ + 0.012,
      ]),
    [w, h],
  )

  return (
    <group>
      <Plate w={w} h={h} color="#1a1016" />

      {/* glossy brand fascia with glowing logo */}
      <RoundedBox args={[w * 0.3, h * 0.88, 0.016]} radius={0.005} smoothness={2} position={[-w * 0.32, 0, FZ - 0.002]} castShadow>
        <meshStandardMaterial color="#0e070b" metalness={0.6} roughness={0.25} />
      </RoundedBox>
      <mesh position={[-w * 0.32, h * 0.08, FZ + 0.008]}>
        <planeGeometry args={[w * 0.26, h * 0.42]} />
        <meshStandardMaterial
          map={labelTexture('FortiSE 1800F', { sub: 'NEXT-GEN FIREWALL', color: '#ff8093', bg: '#0e070b', glow: '#ff4d64' })}
          emissiveMap={labelTexture('FortiSE 1800F', { sub: 'NEXT-GEN FIREWALL', color: '#ff8093', bg: '#0e070b', glow: '#ff4d64' })}
          emissive="#ffffff"
          emissiveIntensity={0.55}
          toneMapped={false}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[-w * 0.32, -h * 0.26, FZ + 0.008]}>
        <boxGeometry args={[w * 0.22, 0.004, 0.002]} />
        <meshStandardMaterial color="#ff4d64" emissive="#ff4d64" emissiveIntensity={0.8} toneMapped={false} />
      </mesh>

      {/* top row: data ports + SFP pair */}
      <mesh position={[blockX, h * 0.22, FZ - 0.002]}>
        <boxGeometry args={[blockW, h * 0.34, 0.014]} />
        <meshStandardMaterial map={rj45Texture(8)} metalness={0.5} roughness={0.6} />
      </mesh>
      <LedStrip positions={ledPos} color={unit.led} altColor="#ffb454" size={0.0038} speed={6} />
      {[0, 1].map((i) => (
        <group key={i} position={[w * 0.28 + i * 0.075, h * 0.22, FZ]}>
          <mesh castShadow>
            <boxGeometry args={[0.062, h * 0.24, 0.016]} />
            <BrushedMaterial color="#241b20" />
          </mesh>
          <mesh position={[0, 0, 0.009]}>
            <boxGeometry args={[0.05, h * 0.13, 0.004]} />
            <meshStandardMaterial color="#03060a" roughness={0.8} metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* bottom row: console / mgmt / USB + status cluster */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-w * 0.06 + i * 0.065, -h * 0.24, FZ]}>
          <boxGeometry args={[0.048, h * 0.2, 0.012]} />
          <meshStandardMaterial color="#04080d" metalness={0.5} roughness={0.7} />
        </mesh>
      ))}
      <Led position={[w * 0.17, -h * 0.24, FZ + 0.004]} color="#ff5d73" size={0.006} speed={2.5} />
      <Led position={[w * 0.21, -h * 0.24, FZ + 0.004]} color="#22e3a6" size={0.006} steady base={0.9} />
      <Led position={[w * 0.25, -h * 0.24, FZ + 0.004]} color="#ffb454" size={0.006} phase={1.4} speed={3.2} />

      {/* big side vent, appliance style */}
      <VentHex w={w * 0.12} h={h * 0.74} x={w * 0.42} bg="#170e13" />
    </group>
  )
}

// ---- decorative (non-interactive) panels --------------------------------

export function VentPanel({ w, h }) {
  return (
    <group>
      <Plate w={w} h={h} color="#0d141d" />
      <VentHex w={w * 0.93} h={h * 0.68} z={FZ - 0.006} />
    </group>
  )
}

export function BlankPanel({ w, h }) {
  return (
    <group>
      <Plate w={w} h={h} color="#0c141d" />
    </group>
  )
}

export function PduPanel({ w, h }) {
  return (
    <group>
      <Plate w={w} h={h} color="#0b1118" />
      {/* C13 outlet bank */}
      <mesh position={[-w * 0.07, 0, FZ - 0.002]}>
        <boxGeometry args={[w * 0.62, h * 0.56, 0.014]} />
        <meshStandardMaterial map={outletsTexture(10)} metalness={0.4} roughness={0.65} />
      </mesh>
      {/* breaker with orange rocker */}
      <group position={[-w * 0.43, 0, FZ]}>
        <mesh>
          <boxGeometry args={[0.05, h * 0.5, 0.016]} />
          <BrushedMaterial color="#1a222c" />
        </mesh>
        <mesh position={[0, h * 0.05, 0.013]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.028, h * 0.28, 0.012]} />
          <meshStandardMaterial color="#d84f3a" roughness={0.55} metalness={0.2} />
        </mesh>
      </group>
      {/* live amp meter */}
      <mesh position={[w * 0.4, 0, FZ]}>
        <boxGeometry args={[0.12, h * 0.52, 0.012]} />
        <meshStandardMaterial
          map={meterTexture('13.8A')}
          emissiveMap={meterTexture('13.8A')}
          emissive="#ffffff"
          emissiveIntensity={0.8}
          toneMapped={false}
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>
      <Led position={[w * 0.31, 0, FZ + 0.004]} color="#22e3a6" size={0.006} steady base={0.9} />
    </group>
  )
}

export function PsuPanel({ w, h }) {
  return (
    <group>
      <Plate w={w} h={h} color="#0d151e" />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * w * 0.235, 0, 0]}>
          <RoundedBox args={[w * 0.42, h * 0.82, 0.02]} radius={0.005} smoothness={2} position={[0, 0, FZ - 0.008]} castShadow>
            <BrushedMaterial color="#131c26" />
          </RoundedBox>
          <Fan x={-w * 0.1} r={h * 0.29} speed={s > 0 ? 11 : 9.3} />
          {/* IEC C14 inlet */}
          <mesh position={[w * 0.06, h * 0.14, FZ]}>
            <boxGeometry args={[0.075, 0.05, 0.014]} />
            <meshStandardMaterial color="#04070b" metalness={0.4} roughness={0.7} />
          </mesh>
          {/* rocker switch */}
          <mesh position={[w * 0.145, h * 0.14, FZ]}>
            <boxGeometry args={[0.028, 0.038, 0.016]} />
            <meshStandardMaterial color="#161c23" roughness={0.6} metalness={0.3} />
          </mesh>
          {/* pull handle */}
          <mesh position={[w * 0.1, -h * 0.22, FZ + 0.01]} castShadow>
            <boxGeometry args={[w * 0.17, 0.015, 0.02]} />
            <BrushedMaterial color="#39465a" />
          </mesh>
          {/* AC OK / DC OK */}
          <Led position={[w * 0.055, -h * 0.04, FZ + 0.004]} color="#22e3a6" size={0.0055} steady base={0.85} />
          <Led position={[w * 0.145, -h * 0.04, FZ + 0.004]} color="#22e3a6" size={0.0055} phase={2.2} speed={1.6} />
        </group>
      ))}
    </group>
  )
}
