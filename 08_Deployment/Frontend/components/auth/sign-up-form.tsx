"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { motion, Variants } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { PasswordStrength } from "./password-strength"
import { SocialAuthButtons } from "./social-auth-buttons"

/* ═══════════════════════════════════════════════════════════════════
   SIGN UP FORM — Brutalist terminal style
   ═══════════════════════════════════════════════════════════════════ */

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.2, ease: "linear" },
  }),
}

export function SignUpForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [institution, setInstitution] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("PASSWORDS DO NOT MATCH")
      return
    }

    if (password.length < 8) {
      setError("PASSWORD MUST BE AT LEAST 8 CHARACTERS")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, institution: institution || undefined }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === "USER_ALREADY_EXISTS") {
          setError("AN ACCOUNT WITH THIS EMAIL ALREADY EXISTS")
        } else if (data.error === "VALIDATION_ERROR") {
          setError(data.details?.[0]?.message?.toUpperCase() || "VALIDATION FAILED")
        } else {
          setError(data.message?.toUpperCase() || "COULD NOT CREATE ACCOUNT")
        }
        setIsLoading(false)
        return
      }

      // Auto sign in after successful signup
      setSuccess(true)
      setTimeout(async () => {
        await signIn("credentials", {
          email,
          password,
          redirect: true,
          callbackUrl: "/",
        })
      }, 1500)
    } catch {
      setError("CONNECTION ERROR — COULD NOT REACH SERVER")
      setIsLoading(false)
    }
  }

  const inputClass =
    "w-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] font-mono text-sm text-white uppercase tracking-widest placeholder:text-[#555555] placeholder:uppercase placeholder:tracking-widest focus:border-[#ea580c] focus:bg-white/10 focus:ring-0 focus:outline-none h-12 px-4 transition-colors disabled:opacity-50"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      {/* Header */}
      <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible" className="mb-1">
        <h2 className="font-mono text-[10px] text-[#ea580c] uppercase tracking-[0.25em] font-bold">
          // CREATE RESEARCHER ACCOUNT
        </h2>
        <div className="mt-2 h-[2px] bg-[#333333]" />
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-2 border-[#ef4444] bg-[#ef4444]/[0.06] p-3">
          <p className="font-mono text-[10px] text-[#ef4444] tracking-[0.15em] uppercase">▸ {error}</p>
        </motion.div>
      )}

      {/* Success */}
      {success && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-2 border-[#22c55e] bg-[#22c55e]/[0.06] p-3">
          <p className="font-mono text-[10px] text-[#22c55e] tracking-[0.15em] uppercase">
            ✓ ACCOUNT CREATED — SIGNING YOU IN...
          </p>
        </motion.div>
      )}

      {/* Full Name */}
      <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
        <label className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] uppercase text-[#888888]">
          FULL NAME
        </label>
        <input
          type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="DR. YOUR NAME" required disabled={isLoading} className={inputClass}
        />
      </motion.div>

      {/* Email */}
      <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
        <label className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] uppercase text-[#888888]">
          EMAIL ADDRESS
        </label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="YOU@UNIVERSITY.EDU" required disabled={isLoading} className={inputClass}
        />
      </motion.div>

      {/* Institution */}
      <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
        <label className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] uppercase text-[#888888]">
          INSTITUTION <span className="text-[#555555]">(OPTIONAL)</span>
        </label>
        <input
          type="text" value={institution} onChange={e => setInstitution(e.target.value)}
          placeholder="FOREST RESEARCH INSTITUTE" disabled={isLoading} className={inputClass}
        />
      </motion.div>

      {/* Password */}
      <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
        <label className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] uppercase text-[#888888]">
          PASSWORD
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"} value={password}
            onChange={e => setPassword(e.target.value)} placeholder="••••••••••••"
            required disabled={isLoading}
            className={`${inputClass} pr-12`}
          />
          <button
            type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#ea580c] transition-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <PasswordStrength password={password} />
      </motion.div>

      {/* Confirm Password */}
      <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
        <label className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] uppercase text-[#888888]">
          CONFIRM PASSWORD
        </label>
        <input
          type={showPassword ? "text" : "password"} value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••••••"
          required disabled={isLoading}
          className={`${inputClass} ${confirmPassword && confirmPassword !== password ? "border-[#ef4444]" : ""}`}
        />
        {confirmPassword && confirmPassword !== password && (
          <p className="font-mono text-[10px] text-[#ef4444] tracking-[0.15em] uppercase mt-1">
            ▸ PASSWORDS DO NOT MATCH
          </p>
        )}
      </motion.div>

      {/* Submit */}
      <motion.div custom={6} variants={fieldVariants} initial="hidden" animate="visible">
        <button
          type="submit" disabled={isLoading}
          className="w-full h-12 bg-[#ea580c] text-white font-mono text-sm tracking-[0.2em] uppercase font-bold border-2 border-[#ea580c] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] hover:bg-transparent hover:text-[#ea580c] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-none disabled:opacity-70 disabled:shadow-none mt-1"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              CREATING ACCOUNT <span className="animate-pulse">█</span>
            </span>
          ) : (
            "▸ CREATE ACCOUNT"
          )}
        </button>
      </motion.div>

      {/* Terms */}
      <motion.div custom={7} variants={fieldVariants} initial="hidden" animate="visible">
        <p className="font-mono text-[9px] text-[#555555] text-center uppercase tracking-[0.1em] leading-relaxed">
          BY CREATING AN ACCOUNT YOU AGREE TO OUR{" "}
          <span className="text-[#ea580c] cursor-pointer hover:underline">TERMS</span> AND{" "}
          <span className="text-[#ea580c] cursor-pointer hover:underline">PRIVACY POLICY</span>
        </p>
      </motion.div>

      {/* Divider */}
      <motion.div custom={8} variants={fieldVariants} initial="hidden" animate="visible">
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-[2px] bg-[#333333]" />
          <span className="font-mono text-[9px] text-[#555555] uppercase tracking-[0.2em]">
            OR CONTINUE WITH
          </span>
          <div className="flex-1 h-[2px] bg-[#333333]" />
        </div>
      </motion.div>

      {/* Social */}
      <motion.div custom={9} variants={fieldVariants} initial="hidden" animate="visible">
        <SocialAuthButtons />
      </motion.div>
    </form>
  )
}
