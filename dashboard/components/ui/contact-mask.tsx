"use client"

import * as React from "react"
import { Lock, Unlock, Phone, Mail, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ── Session-level PIN cache ──────────────────────────────────────────
// Once a salon's PIN is verified in this session, we store it so other
// ContactMask instances for the same salon don't ask again.
const verifiedSalons = new Set<string>()

interface ContactMaskProps {
  value: string
  type: "phone" | "email"
  label?: string
  salonId: string
  className?: string
}

// ── Masking helpers ──────────────────────────────────────────────────
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  const last4 = digits.slice(-4)
  return `(***) ***-${last4}`
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@")
  if (!local || !domain) return "***@***.***"
  return `${local[0]}***@${domain}`
}

// ── PIN input modal ──────────────────────────────────────────────────
function PinModal({
  onVerify,
  onClose,
  error,
  verifying,
}: {
  onVerify: (pin: string) => void
  onClose: () => void
  error: string | null
  verifying: boolean
}) {
  const [digits, setDigits] = React.useState<string[]>([])
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const shakeRef = React.useRef<HTMLDivElement>(null)

  const PIN_LENGTH = 6

  // Shake on error
  React.useEffect(() => {
    if (error && shakeRef.current) {
      shakeRef.current.classList.add("animate-shake")
      const t = setTimeout(
        () => shakeRef.current?.classList.remove("animate-shake"),
        500
      )
      return () => clearTimeout(t)
    }
  }, [error])

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[index] = char
    setDigits(next)

    if (char && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits filled
    const joined = next.filter(Boolean).join("")
    if (joined.length === PIN_LENGTH) {
      onVerify(joined)
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "Escape") onClose()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "")
    if (pasted.length >= PIN_LENGTH) {
      const next = pasted.slice(0, PIN_LENGTH).split("")
      setDigits(next)
      onVerify(next.join(""))
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={shakeRef}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-xs rounded-xl p-6"
        style={{
          background: "linear-gradient(145deg, rgba(30,30,45,0.95), rgba(20,20,35,0.98))",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-5 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/80">
            <Lock size={18} className="text-zinc-400" />
          </div>
          <h3 className="text-sm font-medium text-zinc-200">Enter PIN</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Enter your salon PIN to view this contact
          </p>
        </div>

        {/* Digit inputs */}
        <div className="mb-4 flex justify-center gap-2">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digits[i] ?? ""}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              disabled={verifying}
              className="h-11 w-9 rounded-lg bg-zinc-900/80 text-center text-lg font-semibold text-zinc-100 outline-none ring-1 ring-zinc-700 transition-all focus:ring-2 focus:ring-emerald-500/60 disabled:opacity-50"
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="mb-3 text-center text-xs text-red-400">{error}</p>
        )}

        {/* Verify button */}
        <Button
          onClick={() => onVerify(digits.filter(Boolean).join(""))}
          disabled={digits.filter(Boolean).length < PIN_LENGTH || verifying}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-sm font-medium text-white hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50"
        >
          {verifying ? "Verifying…" : "Verify"}
        </Button>
      </div>

      {/* Shake animation (injected once) */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────
export function ContactMask({
  value,
  type,
  label,
  salonId,
  className,
}: ContactMaskProps) {
  const [revealed, setRevealed] = React.useState(() =>
    verifiedSalons.has(salonId)
  )
  const [showModal, setShowModal] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [verifying, setVerifying] = React.useState(false)

  const masked = type === "phone" ? maskPhone(value) : maskEmail(value)
  const Icon = type === "phone" ? Phone : Mail

  const handleVerify = async (pin: string) => {
    setError(null)
    setVerifying(true)
    try {
      const res = await fetch("/api/salon/pin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salonId, pin }),
      })
      const data = await res.json()

      if (res.ok && data.valid) {
        verifiedSalons.add(salonId)
        setRevealed(true)
        setShowModal(false)
      } else {
        setError("Incorrect PIN")
      }
    } catch {
      setError("Verification failed. Try again.")
    } finally {
      setVerifying(false)
    }
  }

  const handleReveal = () => {
    if (revealed) return
    setShowModal(true)
    setError(null)
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* Label */}
      {label && (
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </span>
      )}

      {/* Display row */}
      <div
        className="flex items-center gap-3 rounded-lg px-3 py-2.5"
        style={{
          background: "rgba(30,30,45,0.6)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Icon */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <Icon size={16} className="text-zinc-400" />
        </div>

        {/* Value */}
        <div className="flex-1 min-w-0">
          <button
            onClick={handleReveal}
            className={cn(
              "flex items-center gap-1.5 text-sm transition-colors",
              revealed
                ? "cursor-default text-zinc-100"
                : "cursor-pointer text-zinc-500 hover:text-zinc-300"
            )}
            style={{ color: revealed ? "#F5F5F7" : "#71717A" }}
            disabled={revealed}
            aria-label={revealed ? undefined : "Click to reveal contact info"}
          >
            {revealed ? value : masked}
            {!revealed && (
              <Lock size={12} className="text-zinc-600" />
            )}
            {revealed && (
              <Unlock size={12} className="text-zinc-600" />
            )}
          </button>
        </div>

        {/* Action buttons (work even when masked) */}
        <div className="flex items-center gap-1.5">
          {type === "phone" && (
            <a
              href={`tel:${value}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/5"
              style={{ color: "#a78bfa" }}
              title="Call"
            >
              <Phone size={14} />
            </a>
          )}
          {type === "email" && (
            <a
              href={`mailto:${value}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/5"
              style={{ color: "#67e8f9" }}
              title="Email"
            >
              <Mail size={14} />
            </a>
          )}
        </div>
      </div>

      {/* PIN Modal */}
      {showModal && (
        <PinModal
          onVerify={handleVerify}
          onClose={() => {
            setShowModal(false)
            setError(null)
          }}
          error={error}
          verifying={verifying}
        />
      )}
    </div>
  )
}

export default ContactMask
