"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { motion, Variants } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { SocialAuthButtons } from "./social-auth-buttons"

/* ═══════════════════════════════════════════════════════════════════
   SIGN IN FORM — Brutalist terminal style
   ═══════════════════════════════════════════════════════════════════ */

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.2, ease: "linear" },
  }),
}

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("AUTHENTICATION FAILED — INVALID CREDENTIALS")
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = "/"
      }, 1000)
    } catch {
      setError("CONNECTION ERROR — COULD NOT REACH AUTH SERVER")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Header */}
      <motion.div
        custom={0}
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
        className="mb-2"
      >
        <h2 className="font-mono text-[10px] text-[#ea580c] uppercase tracking-[0.25em] font-bold">
          // AUTHENTICATION TERMINAL
        </h2>
        <div className="mt-2 h-[2px] bg-[#333333]" />
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-2 border-[#ef4444] bg-[#ef4444]/[0.06] p-3"
        >
          <p className="font-mono text-[10px] text-[#ef4444] tracking-[0.15em] uppercase">
            ▸ {error}
          </p>
        </motion.div>
      )}

      {/* Success */}
      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-2 border-[#22c55e] bg-[#22c55e]/[0.06] p-3"
        >
          <p className="font-mono text-[10px] text-[#22c55e] tracking-[0.15em] uppercase">
            ✓ AUTHENTICATED — REDIRECTING TO DASHBOARD...
          </p>
        </motion.div>
      )}

      {/* Email */}
      <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
        <label className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] uppercase text-[#888888]">
          EMAIL ADDRESS
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="ENTER_EMAIL@DOMAIN.COM"
          required
          disabled={isLoading}
          className="w-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] font-mono text-sm text-white uppercase tracking-widest placeholder:text-[#555555] placeholder:uppercase placeholder:tracking-widest focus:border-[#ea580c] focus:bg-white/10 focus:ring-0 focus:outline-none h-12 px-4 transition-colors disabled:opacity-50"
        />
      </motion.div>

      {/* Password */}
      <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
        <label className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] uppercase text-[#888888]">
          PASSWORD
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            disabled={isLoading}
            className="w-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] font-mono text-sm text-white tracking-widest placeholder:text-[#555555] focus:border-[#ea580c] focus:bg-white/10 focus:ring-0 focus:outline-none h-12 px-4 pr-12 transition-colors disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#ea580c] transition-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </motion.div>

      {/* Forgot password */}
      <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible" className="flex justify-end">
        <button
          type="button"
          className="font-mono text-[10px] text-[#555555] hover:text-[#ea580c] transition-none uppercase tracking-[0.15em]"
        >
          FORGOT PASSWORD?
        </button>
      </motion.div>

      {/* Submit */}
      <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#ea580c] text-white font-mono text-sm tracking-[0.2em] uppercase font-bold border-2 border-[#ea580c] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] hover:bg-transparent hover:text-[#ea580c] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-none disabled:opacity-70 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              AUTHENTICATING <span className="animate-pulse">█</span>
            </span>
          ) : (
            "▸ SIGN IN"
          )}
        </button>
      </motion.div>

      {/* Divider */}
      <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-[2px] bg-[#333333]" />
          <span className="font-mono text-[9px] text-[#555555] uppercase tracking-[0.2em]">
            OR CONTINUE WITH
          </span>
          <div className="flex-1 h-[2px] bg-[#333333]" />
        </div>
      </motion.div>

      {/* Social */}
      <motion.div custom={6} variants={fieldVariants} initial="hidden" animate="visible">
        <SocialAuthButtons />
      </motion.div>
    </form>
  )
}
