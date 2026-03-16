"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float } from "@react-three/drei"
import * as THREE from "three"

/* ─── Individual ring (torus) ────────────────────────────────────── */
function Ring({
  radius,
  thickness,
  color,
  speed,
  delay,
}: {
  radius: number
  thickness: number
  color: string
  speed: number
  delay: number
}) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    // Gentle breathing pulse
    const scale = 1 + Math.sin(t * speed + delay) * 0.02
    ref.current.scale.set(scale, scale, 1)
    // Subtle glow pulse via opacity
    const mat = ref.current.material as THREE.MeshStandardMaterial
    mat.opacity = 0.55 + Math.sin(t * speed * 0.7 + delay) * 0.15
  })

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, thickness, 32, 128]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.6}
        roughness={0.3}
        metalness={0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/* ─── Central pith dot ───────────────────────────────────────────── */
function Pith() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const s = 1 + Math.sin(t * 1.2) * 0.08
    ref.current.scale.set(s, s, s)
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.12, 32, 32]} />
      <meshStandardMaterial
        color="#10B981"
        emissive="#10B981"
        emissiveIntensity={0.8}
        roughness={0.2}
        metalness={0.6}
      />
    </mesh>
  )
}

/* ─── Rotating scanner line ──────────────────────────────────────── */
function ScannerLine() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.z = clock.getElapsedTime() * 0.3
  })

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]}>
      <planeGeometry args={[3.4, 0.01]} />
      <meshBasicMaterial color="#10B981" transparent opacity={0.4} />
    </mesh>
  )
}

/* ─── Particle dust floating around ──────────────────────────────── */
function Particles({ count = 60 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = 0.3 + Math.random() * 2.0
      pos[i * 3] = Math.cos(angle) * r
      pos[i * 3 + 1] = Math.sin(angle) * r
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5
    }
    return pos
  }, [count])

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.z = clock.getElapsedTime() * 0.05
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#10B981"
        size={0.015}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  )
}

/* ─── The full tree ring cross-section scene ─────────────────────── */
function TreeRingScene() {
  const groupRef = useRef<THREE.Group>(null)

  // Ring data: radius, thickness, color, animation speed, delay offset
  const rings = useMemo(
    () => [
      { radius: 0.30, thickness: 0.035, color: "#065F46", speed: 0.8, delay: 0 },
      { radius: 0.50, thickness: 0.030, color: "#047857", speed: 0.9, delay: 1 },
      { radius: 0.70, thickness: 0.028, color: "#059669", speed: 0.7, delay: 2 },
      { radius: 0.88, thickness: 0.032, color: "#10B981", speed: 1.0, delay: 3 },
      { radius: 1.05, thickness: 0.025, color: "#34D399", speed: 0.6, delay: 4 },
      { radius: 1.22, thickness: 0.030, color: "#6366F1", speed: 0.85, delay: 5 },
      { radius: 1.38, thickness: 0.028, color: "#818CF8", speed: 0.75, delay: 6 },
      { radius: 1.54, thickness: 0.032, color: "#A78BFA", speed: 0.95, delay: 7 },
      { radius: 1.68, thickness: 0.025, color: "#F59E0B", speed: 0.65, delay: 8 },
    ],
    []
  )

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    // Very slow gentle rotation of the whole assembly
    groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.15) * 0.1
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        <Pith />
        {rings.map((r, i) => (
          <Ring key={i} {...r} />
        ))}
        <ScannerLine />
        <Particles />
      </group>
    </Float>
  )
}

/* ─── Exported component with Canvas wrapper ─────────────────────── */
export function TreeRingVisualization() {
  return (
    <div className="h-full w-full" style={{ minHeight: "400px" }}>
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 5]} intensity={0.8} color="#10B981" />
        <pointLight position={[-3, -2, 4]} intensity={0.4} color="#6366F1" />
        <pointLight position={[0, 0, 3]} intensity={0.3} color="#F59E0B" />
        <TreeRingScene />
      </Canvas>
    </div>
  )
}
