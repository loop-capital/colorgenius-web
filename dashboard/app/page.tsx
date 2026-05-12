'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        window.location.href = '/dashboard'
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err: any) {
      setError('Network error: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0A1A] text-white overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0A1A]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#9333EA] to-[#EC4899] flex items-center justify-center">
              <span className="text-white font-black text-sm">CG</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">ColorGenius</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <button onClick={() => setShowLogin(true)}
            className="bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
            Sign In
          </button>
        </div>
      </nav>

      {showLogin && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowLogin(false)}>
          <motion.div className="bg-[#161620] border border-white/10 rounded-2xl p-8 w-full max-w-md"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-6">Welcome back</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#9333EA]" placeholder="you@salon.com" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#9333EA]" placeholder="Password" />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}

      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#9333EA]/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#EC4899]/15 blur-[100px] pointer-events-none" />
        <motion.div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
            Stop Guessing.<br />
            <span className="bg-gradient-to-r from-[#9333EA] to-[#EC4899] bg-clip-text text-transparent">Start Formulating.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-4 leading-relaxed">
            AI-powered hair color formulation that analyzes your client's hair and delivers a precise formula — shades, developer, ratios, and processing time — in seconds.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="inline-flex items-center gap-2 border border-[#9333EA]/30 bg-[#9333EA]/10 text-[#9333EA] text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            1,000+ professional shades · 10 color lines · 90%+ formulation accuracy
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => setShowLogin(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-bold text-base px-8 py-4 rounded-full hover:opacity-90 shadow-lg shadow-[#9333EA]/25">
              Join the Beta
            </button>
            <a href="#how-it-works"
              className="w-full sm:w-auto border border-white/20 text-white/80 font-semibold text-base px-8 py-4 rounded-full hover:bg-white/5 text-center">
              See How It Works
            </a>
          </motion.div>
        </motion.div>
      </section>

      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-6xl mx-auto text-center mb-20">
          <p className="text-[#9333EA] font-semibold text-sm uppercase tracking-widest mb-4">Simple by Design</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5">Three steps. Zero guesswork.</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">From photo to formula in under 30 seconds.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { n: "01", t: "Capture Your Client's Hair", d: "Take a photo. Our AI reads level, tone, condition — and flags safety concerns." },
            { n: "02", t: "Choose the Target Shade", d: "Pick from your brand's catalog. ColorGenius calculates the exact formulation." },
            { n: "03", t: "Get Your Formula", d: "Complete formula card with mixing ratios, developer, and processing time." },
          ].map((s, i) => (
            <div key={s.n} className="border border-white/10 bg-white/5 rounded-2xl p-8 hover:border-[#9333EA]/40 transition-colors">
              <span className="text-6xl font-black text-white/5 select-none block mb-4">{s.n}</span>
              <h3 className="text-xl font-bold text-white mb-3">{s.t}</h3>
              <p className="text-white/50 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <p className="text-[#9333EA] font-semibold text-sm uppercase tracking-widest mb-4">Built for Pros</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5">Everything you need at the bowl</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {[
            { t: "AI Photo Analysis", d: "Detects level, tone, porosity, condition. Flags metallic dye, henna, previous treatments.", i: "🧠" },
            { t: "Precision Formulation", d: "Exact shade mix, developer volume, processing time based on 10+ variables.", i: "🎯" },
            { t: "Result Scoring", d: "Before/after comparison scoring color accuracy, condition, and evenness.", i: "📊" },
            { t: "Client History", d: "Every formula, photo, and result saved. Complete color history one tap away.", i: "🔒" },
            { t: "Smart Questionnaire", d: "Treatment history, allergies, texture. AI uses every answer to refine results.", i: "📋" },
            { t: "Multi-Line Support", d: "Redken, Wella, Schwarzkopf, Davines, L'Oréal. Each brand's ratios and systems.", i: "🏪" },
          ].map((f) => (
            <div key={f.t} className="border border-white/10 bg-white/5 rounded-2xl p-6 hover:border-[#9333EA]/30 transition-colors">
              <span className="text-2xl mb-4 block">{f.i}</span>
              <h3 className="text-base font-bold text-white mb-2">{f.t}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <p className="text-[#9333EA] font-semibold text-sm uppercase tracking-widest mb-4">Free During Beta</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5">$0 through August 2026</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {[
            { n: "Professional", p: "$29/mo", f: ["Unlimited formulations", "8+ color lines", "AI learning"] },
            { n: "Pro+", p: "$49/mo", f: ["All brands", "Advanced AI", "Priority support"] },
            { n: "Salon", p: "$149/mo", f: ["5 seats", "Team analytics", "Client management"], h: true },
            { n: "Salon+", p: "$299/mo", f: ["15 seats", "Inventory integration", "Custom reporting"] },
          ].map((t) => (
            <div key={t.n} className={`relative rounded-2xl p-6 border ${t.h ? 'border-[#9333EA]/50 bg-[#9333EA]/10' : 'border-white/10 bg-white/5'}`}>
              {t.h && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white text-[10px] font-bold px-3 py-1 rounded-full">Popular</div>}
              <h3 className="text-base font-bold text-white">{t.n}</h3>
              <p className="text-3xl font-black text-white mt-3">{t.p}</p>
              <ul className="space-y-2 mt-4">
                {t.f.map(f => <li key={f} className="text-xs text-white/60"><span className="text-[#9333EA]">✓</span> {f}</li>)}
              </ul>
              <p className="text-[10px] text-white/30 mt-4">After beta · Beta testers get permanent discount</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-[#9333EA] font-semibold text-sm uppercase tracking-widest mb-4">Common Questions</p>
          <h2 className="text-4xl md:text-5xl font-black text-white">FAQ</h2>
        </div>
        <div className="space-y-4 max-w-3xl mx-auto">
          {[
            { q: "Which color lines do you support?", a: "Redken, Wella, Schwarzkopf, Davines, and L'Oréal Professionnel at launch, with more added based on demand." },
            { q: "Does it replace my color training?", a: "No. ColorGenius handles the calculation so you can focus on the art. Think of it as a calculator for colorists." },
            { q: "Is client data secure?", a: "Yes. All photos and client data are encrypted and never shared." },
            { q: "How much does beta cost?", a: "Completely free. Beta testers get a lifetime discount on future paid plans." },
          ].map((f) => (
            <div key={f.q} className="border border-white/10 bg-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-2">{f.q}</h3>
              <p className="text-sm text-white/50">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Your next great formulation starts here.</h2>
          <p className="text-white/50 text-lg mb-10">Join 50 founding stylists. Free during beta. No credit card required.</p>
          <button onClick={() => setShowLogin(true)}
            className="bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-bold text-base px-10 py-4 rounded-full hover:opacity-90 shadow-lg shadow-[#9333EA]/25">
            Join the Beta
          </button>
        </div>
      </section>

      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/40 text-sm">ColorGenius · AI Hair Color Formulation for Professionals</span>
          <p className="text-white/25 text-xs">© 2026 ColorGenius Inc.</p>
        </div>
      </footer>
    </main>
  )
}
