import * as THREE from 'three'

// Procedural canvas textures for the rack. Everything is generated once and
// cached, so repeated calls with the same params are free.

const cache = new Map()

function makeTexture(key, w, h, draw, { repeat = null, srgb = true } = {}) {
  if (cache.has(key)) return cache.get(key)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  draw(canvas.getContext('2d'), w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 8
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(repeat[0], repeat[1])
  }
  cache.set(key, tex)
  return tex
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

// Hex-packed perforation (server vents, mesh doors, fan grilles).
export function hexPerfTexture(repeatX = 1, repeatY = 1, bg = '#131a23') {
  return makeTexture(`hex|${repeatX}|${repeatY}|${bg}`, 256, 256, (ctx, w, h) => {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.02})`
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
    }
    const dx = 16
    const dy = 16
    const r = 5.4
    for (let row = 0; row < h / dy; row++) {
      const off = row % 2 ? dx / 2 : 0
      for (let col = 0; col * dx <= w; col++) {
        const cx = col * dx + off
        const cy = row * dy + dy / 2
        // lit bottom rim gives the holes depth
        ctx.fillStyle = 'rgba(190,215,240,0.16)'
        ctx.beginPath()
        ctx.arc(cx, cy + 1.4, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#010408'
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }, { repeat: [repeatX, repeatY] })
}

// Grayscale streaks — shared as roughnessMap + bumpMap for brushed steel.
export function brushedTexture() {
  return makeTexture('brushed', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#9c9c9c'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 2400; i++) {
      const y = Math.random() * h
      const x = Math.random() * w
      const len = 30 + Math.random() * 220
      const light = Math.random() > 0.5
      ctx.strokeStyle = `rgba(${light ? '255,255,255' : '0,0,0'},${0.03 + Math.random() * 0.05})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + len, y)
      ctx.stroke()
    }
  }, { repeat: [2, 2], srgb: false })
}

// EIA-310 mounting rail: 3 square cage-nut holes per U + printed U numbers.
export function railTexture(totalU) {
  const uPx = 96
  return makeTexture(`rail|${totalU}`, 96, totalU * uPx, (ctx, cw, ch) => {
    const g = ctx.createLinearGradient(0, 0, cw, 0)
    g.addColorStop(0, '#2b3641')
    g.addColorStop(0.45, '#3a4653')
    g.addColorStop(1, '#222c37')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, cw, ch)
    for (let u = 0; u < totalU; u++) {
      const top = u * uPx
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(0, top, cw, 2)
      for (const f of [1 / 6, 3 / 6, 5 / 6]) {
        const cy = top + f * uPx
        const s = 30
        const x = cw / 2 - s / 2 + 10
        ctx.fillStyle = 'rgba(215,232,248,0.22)'
        ctx.fillRect(x - 2, cy - s / 2 - 2, s + 4, s + 4)
        ctx.fillStyle = '#04070b'
        ctx.fillRect(x, cy - s / 2, s, s)
        ctx.fillStyle = 'rgba(120,150,175,0.45)'
        ctx.fillRect(x, cy + s / 2 - 3, s, 3)
      }
      ctx.fillStyle = 'rgba(205,220,235,0.55)'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(totalU - u), 7, top + uPx / 2)
    }
  })
}

// Generic branding / LCD label.
export function labelTexture(text, {
  w = 512, h = 128, color = '#dbe4ec', bg = '#0a0f15', sub = null, glow = null,
} = {}) {
  return makeTexture(`label|${text}|${sub}|${color}|${bg}|${w}x${h}`, w, h, (ctx) => {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    if (glow) {
      ctx.shadowColor = glow
      ctx.shadowBlur = 16
    }
    ctx.fillStyle = color
    ctx.font = `700 ${Math.round(sub ? h * 0.36 : h * 0.46)}px "Segoe UI", Arial, sans-serif`
    ctx.fillText(text, w / 2, sub ? h * 0.34 : h * 0.52)
    if (sub) {
      ctx.shadowBlur = 0
      ctx.font = `500 ${Math.round(h * 0.19)}px Arial`
      ctx.fillStyle = 'rgba(185,200,215,0.7)'
      ctx.fillText(sub, w / 2, h * 0.74)
    }
  })
}

// Strip of RJ45 jacks with gold pins and clip notches.
export function rj45Texture(ports = 12) {
  const pw = 64
  const h = 96
  return makeTexture(`rj45|${ports}`, pw * ports, h, (ctx, w) => {
    ctx.fillStyle = '#10161d'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < ports; i++) {
      const x = i * pw
      ctx.fillStyle = '#02050a'
      roundRect(ctx, x + 8, 16, pw - 16, 64, 5)
      ctx.fill()
      ctx.fillStyle = '#0c1219'
      ctx.fillRect(x + pw / 2 - 10, 66, 20, 14)
      ctx.fillStyle = 'rgba(212,175,90,0.9)'
      for (let p = 0; p < 8; p++) ctx.fillRect(x + 14 + p * 4.6, 20, 2.4, 10)
      ctx.strokeStyle = 'rgba(160,180,200,0.28)'
      ctx.lineWidth = 1.5
      roundRect(ctx, x + 8, 16, pw - 16, 64, 5)
      ctx.stroke()
    }
  })
}

// Strip of IEC C13 outlets for the PDU.
export function outletsTexture(n = 10) {
  const ow = 64
  const h = 64
  return makeTexture(`c13|${n}`, ow * n, h, (ctx, w) => {
    ctx.fillStyle = '#0b1016'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < n; i++) {
      const cx = i * ow + ow / 2
      ctx.fillStyle = '#05080d'
      roundRect(ctx, cx - 23, 7, 46, 50, 6)
      ctx.fill()
      ctx.strokeStyle = 'rgba(150,170,190,0.22)'
      ctx.lineWidth = 1.5
      roundRect(ctx, cx - 23, 7, 46, 50, 6)
      ctx.stroke()
      // C13 opening (chamfered top corners)
      ctx.fillStyle = '#010306'
      ctx.beginPath()
      ctx.moveTo(cx - 15, 20)
      ctx.lineTo(cx - 9, 13)
      ctx.lineTo(cx + 9, 13)
      ctx.lineTo(cx + 15, 20)
      ctx.lineTo(cx + 15, 50)
      ctx.lineTo(cx - 15, 50)
      ctx.closePath()
      ctx.fill()
      // pin slots
      ctx.fillStyle = '#131a22'
      ctx.fillRect(cx - 10, 24, 5, 14)
      ctx.fillRect(cx - 2.5, 24, 5, 14)
      ctx.fillRect(cx + 5, 24, 5, 14)
    }
  })
}

// Green seven-segment style readout for the PDU amp meter.
export function meterTexture(text = '13.8A') {
  return makeTexture(`meter|${text}`, 192, 96, (ctx, w, h) => {
    ctx.fillStyle = '#020604'
    ctx.fillRect(0, 0, w, h)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = '#2dffb0'
    ctx.shadowBlur = 12
    ctx.fillStyle = '#3cf0ae'
    ctx.font = 'bold 54px "Courier New", monospace'
    ctx.fillText(text, w / 2, h / 2 + 2)
  })
}

// Hot-swap drive sled front: fine perforation grid, capacity label,
// release latch recess and a light-pipe channel on the right.
export function caddyTexture() {
  return makeTexture('caddy', 192, 96, (ctx, w, h) => {
    ctx.fillStyle = '#161d26'
    ctx.fillRect(0, 0, w, h)
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, 'rgba(255,255,255,0.06)')
    g.addColorStop(0.2, 'rgba(255,255,255,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.3)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    // capacity label top-left
    ctx.fillStyle = 'rgba(195,210,225,0.55)'
    ctx.font = 'bold 10px Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('2.4TB SAS 10K', 10, 12)
    // perforation grid
    for (let y = 26; y <= 58; y += 8) {
      for (let x = 12; x <= 138; x += 8) {
        ctx.fillStyle = 'rgba(200,220,240,0.13)'
        ctx.beginPath()
        ctx.arc(x, y + 1, 2.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#040709'
        ctx.beginPath()
        ctx.arc(x, y, 2.6, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    // light-pipe channel right
    ctx.fillStyle = '#0a1017'
    ctx.fillRect(152, 6, 18, 62)
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    ctx.strokeRect(152, 6, 18, 62)
    // latch recess + release button
    ctx.fillStyle = '#0c1219'
    ctx.fillRect(6, 72, w - 12, 20)
    ctx.fillStyle = '#28323e'
    roundRect(ctx, 10, 75, w - 66, 14, 4)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(10, 75, w - 66, 3)
    ctx.fillStyle = '#1b242f'
    roundRect(ctx, w - 48, 75, 38, 14, 3)
    ctx.fill()
  })
}

// Torx screw head, mapped onto tiny cylinder caps.
export function screwTexture() {
  return makeTexture('screw', 64, 64, (ctx, w, h) => {
    const g = ctx.createRadialGradient(32, 24, 4, 32, 32, 30)
    g.addColorStop(0, '#e9eef3')
    g.addColorStop(0.65, '#98a5b2')
    g.addColorStop(1, '#5a6470')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#1a2129'
    ctx.translate(32, 32)
    ctx.beginPath()
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      const r = i % 2 ? 5 : 11
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
    }
    ctx.closePath()
    ctx.fill()
  })
}
