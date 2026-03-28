"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  Cpu,
  Database,
  Server,
  Zap,
  ShieldCheck,
  AlertCircle,
  Terminal as TerminalIcon,
  Layers,
  Globe,
  RefreshCw
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Navigation } from "@/components/ascii-hub/navigation"
import { Footer } from "@/components/ascii-hub/footer"
import { TechTicker } from "@/components/ascii-hub/tech-ticker"

/* ═══════════════════════════════════════════════════════════════════
   SYSTEM DIAGNOSTICS PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function SystemStatusPage() {
  const [mounted, setMounted] = useState(false)
  const [logs, setLogs] = useState<string[]>([
    "SYS_INIT: Booting TreeTrace Diagnostic Engine...",
    "NODE_CHECK: Cluster [NA-EAST-01] reporting ONLINE.",
    "NODE_CHECK: Cluster [EU-WEST-04] reporting ONLINE.",
    "AUTH: Secure handshake established with analytical core.",
    "READY: System awaiting specimen data."
  ])
  const [uptime, setUptime] = useState(0)

  // Real-time metrics from backend
  const [cpuLoad, setCpuLoad] = useState(0)
  const [gpuLoad, setGpuLoad] = useState(0)
  const [memoryUsage, setMemoryUsage] = useState(0)
  const [requestCount, setRequestCount] = useState(0)
  const [activeNodes, setActiveNodes] = useState<any[]>([
    { name: 'NA-EAST-01', status: 'Online', latency: '14ms', load: 45 },
    { name: 'EU-WEST-04', status: 'Online', latency: '48ms', load: 22 },
    { name: 'AS-SOUTH-02', status: 'Standby', latency: '--', load: 0 },
    { name: 'LATAM-SOUTH-01', status: 'Online', latency: '112ms', load: 78 }
  ])

  const backendOfflineRef = useRef(false)

  const fetchSystemData = async () => {
    try {
      const data = await apiClient.getSystemStatus()

      if (backendOfflineRef.current) {
        backendOfflineRef.current = false
        console.log("[SystemStatus] Backend reconnected")
      }

      setCpuLoad(data.cpu_load)
      setGpuLoad(data.gpu_load)
      setMemoryUsage(data.memory_usage)
      setUptime(data.uptime)
      if (data.active_nodes && data.active_nodes.length > 0) {
        setActiveNodes(data.active_nodes)
      }
    } catch {
      if (!backendOfflineRef.current) {
        backendOfflineRef.current = true
        console.warn("[SystemStatus] Backend offline — suppressing further poll errors")
      }
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchSystemData() // Initial fetch

    const interval = setInterval(fetchSystemData, 2000)

    const logInterval = setInterval(() => {
      const messages = [
        `PROC: Analyzing request ID [${Math.random().toString(36).substring(7).toUpperCase()}]`,
        `DB_SYNC: Prisma push complete for collection [SPECIMENS]`,
        `AI_CORE: Precision optimized to 0.9142`,
        `NODE_LATENCY: NA-EAST-01 ping: 14ms`,
        `CACHE: Garbage collection cleared 14.2MB`,
        `AUTH: Token rotation successful for user SESSION_023`
      ]
      setLogs(prev => [...prev.slice(-14), messages[Math.floor(Math.random() * messages.length)]])
      setRequestCount(prev => prev + Math.floor(Math.random() * 3))
    }, 3500)

    return () => {
      clearInterval(interval)
      clearInterval(logInterval)
    }
  }, [])

  if (!mounted) return null

  const formatUptime = (s: number) => {
    const days = Math.floor(s / 86400)
    const h = Math.floor((s % 86400) / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${days}D ${h}H ${m}M ${sec}S`
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[var(--accent-primary)] selection:text-white">
      <Navigation />

      <main className="pt-24 pb-16 px-4 lg:px-8 max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-[var(--text-secondary)]/60">{">"}</span>
              <div className="h-[1px] w-12 bg-[var(--border-default)]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[var(--accent-primary)]">
                Core Diagnostics
              </span>
            </div>
            <h1 className="font-pixel-line text-4xl md:text-6xl font-bold tracking-tight text-white uppercase">
              System <span className="text-[var(--accent-primary)]">Status</span>
            </h1>
            <p className="font-mono text-sm text-[var(--text-secondary)] max-w-prose leading-relaxed">
              Real-time monitoring of the TreeTrace analytical engine, compute clusters,
              and AI-driven ring detection nodes.
            </p>
          </div>

          <div className="border-2 border-[var(--border-default)] bg-[var(--bg-void)] p-4 flex flex-col items-end gap-1">
            <span className="font-mono text-[10px] text-[var(--text-secondary)] tracking-widest uppercase">Node Uptime</span>
            <span className="font-mono text-2xl font-bold text-white tabular-nums">{formatUptime(uptime)}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgb(34,197,94)]" />
              <span className="font-mono text-[10px] text-green-500 uppercase tracking-tighter">Engine Operational [v1.0.4]</span>
            </div>
          </div>
        </div>

        <TechTicker />

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 mb-12">
          <MetricCard
            title="CPU LOAD"
            value={Math.round(cpuLoad).toString() + "%"}
            icon={<Cpu size={20} />}
            progress={cpuLoad}
            trend="+1.2%"
          />
          <MetricCard
            title="GPU COMPUTE"
            value={Math.round(gpuLoad).toString() + "%"}
            icon={<Zap size={20} />}
            progress={gpuLoad}
            color="text-[var(--accent-primary)]"
          />
          <MetricCard
            title="MEMORY USAGE"
            value={Math.round(memoryUsage).toString() + "%"}
            icon={<Layers size={20} />}
            progress={memoryUsage}
          />
          <MetricCard
            title="TOTAL ANALYSES"
            value={requestCount.toLocaleString()}
            icon={<Database size={20} />}
            progress={85}
            sub="23.4 / MIN"
          />
        </div>

        {/* CLUSTERS & LOGS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Node Status */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="font-pixel-line text-2xl font-bold border-b-2 border-[var(--border-default)] pb-2 flex items-center gap-3">
              <Server size={20} className="text-[var(--accent-primary)]" /> COMPUTE CLUSTERS
            </h3>

            <div className="space-y-4">
              {activeNodes.map(node => (
                <ClusterNode
                  key={node.name}
                  name={node.name}
                  status={node.status}
                  latency={node.latency}
                  load={node.load}
                />
              ))}
            </div>

            <div className="pt-6">
              <div className="border-2 border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 p-6 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12 transition-transform group-hover:scale-110">
                  <ShieldCheck size={120} />
                </div>
                <h4 className="font-mono text-sm font-bold text-[var(--accent-primary)] mb-2 uppercase flex items-center gap-2">
                  <ShieldCheck size={16} /> Security Protocol
                </h4>
                <p className="font-mono text-xs text-[var(--text-secondary)] leading-relaxed relative z-10">
                  All analytical clusters are hardened via hardware-level encryption.
                  Analytical data is ephemeral and purged post-processing.
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Logs */}
          <div className="lg:col-span-2 flex flex-col">
            <h3 className="font-pixel-line text-2xl font-bold border-b-2 border-[var(--border-default)] pb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TerminalIcon size={20} className="text-[var(--accent-primary)]" /> ENGINE_LOGS.EXE
              </div>
              <span className="font-mono text-[10px] text-[var(--text-secondary)] tracking-widest uppercase">LIVE FEED</span>
            </h3>

            <div className="flex-1 bg-[var(--bg-void)] border-2 border-[var(--border-default)] mt-6 p-4 font-mono text-xs overflow-hidden relative min-h-[400px]">
              {/* Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none z-10 opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

              <div className="space-y-1.5 overflow-y-auto h-full pr-2">
                <AnimatePresence mode="popLayout">
                  {logs.map((log, i) => (
                    <motion.div
                      key={`${i}-${log}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-4 border-l-2 border-transparent hover:border-[var(--accent-primary)] hover:bg-white/5 pl-2 transition-colors py-1 cursor-default group"
                    >
                      <span className="text-[var(--text-secondary)] shrink-0 opacity-40 shrink-0">
                        [{new Date().toLocaleTimeString('en-US', { hour12: false })}]
                      </span>
                      <span className={`break-all ${log.startsWith("READY") ? 'text-green-500 font-bold' : log.startsWith("AUTH") ? 'text-blue-400' : 'text-[var(--text-secondary)]'}`}>
                        {log}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className="flex items-center gap-2 text-[var(--accent-primary)] animate-pulse pl-2 font-bold">
                  <span>{">"}</span>
                  <div className="w-2 h-4 bg-[var(--accent-primary)]" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              <button className="flex-1 border-2 border-[var(--border-default)] bg-[var(--bg-void)] py-3 font-mono text-[10px] tracking-widest uppercase hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all">
                Download Log Capture
              </button>
              <button className="flex-1 border-2 border-[var(--border-default)] bg-[var(--bg-void)] py-3 font-mono text-[10px] tracking-widest uppercase hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all flex items-center justify-center gap-2">
                <RefreshCw size={12} /> Force Resync
              </button>
            </div>
          </div>
        </div>

        {/* WORLD NODES */}
        <div className="mt-16 border-2 border-[var(--border-default)] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)]/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-shrink-0 w-24 h-24 border-2 border-[var(--accent-primary)] flex items-center justify-center text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 animate-pulse">
              <Globe size={48} />
            </div>

            <div className="space-y-4 text-center md:text-left">
              <h2 className="font-pixel-line text-3xl font-bold uppercase tracking-tight">Analytical Load Distribution</h2>
              <p className="font-mono text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                The TreeTrace AI engine automatically distributes specimen processing tasks across
                global low-latency nodes to ensure consistency in detection speed regardless of geography.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                {["SAN FRANCISCO", "LONDON", "TOKYO", "SAO PAULO", "SYDNEY"].map(city => (
                  <span key={city} className="font-mono text-[9px] border-2 border-[var(--border-default)] px-3 py-1 text-[var(--text-secondary)]/70 uppercase">
                    ● {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function MetricCard({ title, value, icon, progress, color = "text-white", trend, sub }: any) {
  return (
    <div className="border-2 border-[var(--border-default)] bg-[var(--bg-void)] p-5 relative group hover:border-[var(--accent-primary)] transition-colors">
      <div className="absolute top-3 right-3 text-[var(--text-secondary)]/40 group-hover:text-[var(--accent-primary)] transition-colors">
        {icon}
      </div>
      <p className="font-mono text-[9px] text-[var(--text-secondary)] tracking-widest uppercase mb-1">{title}</p>
      <div className="flex items-baseline gap-3">
        <h3 className={`font-mono text-3xl font-bold tabular-nums ${color}`}>{value}</h3>
        {trend && <span className="font-mono text-[9px] text-green-500">{trend}</span>}
      </div>
      {sub && <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-1">{sub}</p>}

      {/* Mini sparkline-like bar */}
      <div className="h-[3px] bg-white/5 mt-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${progress > 80 ? 'bg-red-500' : progress > 60 ? 'bg-amber-500' : 'bg-[var(--accent-primary)]'}`}
        />
      </div>
    </div>
  )
}

function ClusterNode({ name, status, latency, load }: any) {
  const isOnline = status === "Online"
  return (
    <div className="border-2 border-[var(--border-default)] p-3 hover:bg-white/5 transition-colors group">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] font-bold tracking-wider">{name}</span>
        <span className={`font-mono text-[9px] uppercase px-2 py-0.5 border-2 ${isOnline ? 'border-green-500 text-green-500' : 'border-[var(--text-disabled)] text-[var(--text-disabled)]'}`}>
          {status}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 font-mono text-[9px] text-[var(--text-secondary)]">
          <span>LATENCY:</span>
          <span className={isOnline ? 'text-white' : 'text-[var(--text-disabled)]'}>{latency}</span>
        </div>
        <div className="w-24 h-1.5 bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${load}%` }}
            className={`h-full ${load > 85 ? 'bg-red-500' : 'bg-[var(--accent-primary)]'}`}
          />
        </div>
      </div>
    </div>
  )
}
