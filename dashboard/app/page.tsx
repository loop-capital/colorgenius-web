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
      {/* Navbar */}
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
          <button
            onClick={() => setShowLogin(true)}
            className="bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Login Modal */}
      {showLogin && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowLogin(false)}
        >
          <motion.div
            className="bg-[#161620] border border-white/10 rounded-2xl p-8 w-full max-w-md"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9333EA] to-[#EC4899] flex items-center justify-center">
                <span className="text-white font-black text-sm">CG</span>
              </div>
              <h2 className="text-xl font-bold text-white">Welcome back</h2>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#9333EA] transition-colors"
                  placeholder="you@salon.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#9333EA] transition-colors"
                  placeholder="••••••••" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#9333EA]/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#EC4899]/15 blur-[100px] pointer-events-none" />

        <motion.div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6"
          >
            Stop Guessing.
            <br />
            <span className="bg-gradient-to-r from-[#9333EA] to-[#EC4899] bg-clip-text text-transparent">
              Start Formulating.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-4 leading-relaxed"
          >
            AI-powered hair color formulation that analyzes your client's hair and delivers a precise formula — shades, developer, ratios, and processing time — in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="inline-flex items-center gap-2 border border-[#9333EA]/30 bg-[#9333EA]/10 text-[#9333EA] text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            1,000+ professional shades · 10 color lines · 90%+ formulation accuracy
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => setShowLogin(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-bold text-base px-8 py-4 rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-[#9333EA]/25"
            >
              Join the Beta
            </button>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto border border-white/20 text-white/80 font-semibold text-base px-8 py-4 rounded-full hover:bg-white/5 transition-colors text-center"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 flex flex-col items-center gap-3"
          >
            <div className="flex -space-x-2">
              {["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6"].map((color, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-[#0A0A1A] flex items-center justify-center text-xs font-bold" style={{ background: color }}>
                  {["JD", "SM", "AK", "TR", "LM"][i]}
                </div>
              ))}
            </div>
            <p className="text-white/40 text-sm">
              "The future of hair color." — Coming to salons August 2026
            </p>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border-2 border-white/20 flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="text-center mb-20">
            <p className="text-[#9333EA] font-semibold text-sm uppercase tracking-widest mb-4">Simple by Design</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5">Three steps. Zero guesswork.</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              From photo to formula in under 30 seconds. Built to slot into your existing workflow, not replace it.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                number: "01", title: "Capture Your Client's Hair",
                description: "Take a photo of your client's hair (or upload one). Our AI reads the level, tone, and condition — accounting for previous treatments, texture, and safety flags like metallic dye or henna.",
                icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
              },
              {
                number: "02", title: "Choose the Target Shade",
                description: "Pick the shade your client wants from your preferred brand's catalog. ColorGenius cross-references starting level, underlying pigment, and desired outcome to calculate the exact formulation.",
                icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
              },
              {
                number: "03", title: "Get Your Formula — and Score the Result",
                description: "Receive a complete formula card with mixing ratios, developer volume, and processing time. After the service, snap an after photo and our AI scores the result — learning and improving with every use.",
                icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
              },
            ].map((step, i) => (
              <motion.div key={step.number} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, delay: i * 0.15 }} className="relative group">
                {i < 2 && <div className="hidden md:block absolute top-14 left-full w-full h-px bg-gradient-to-r from-[#9333EA]/40 to-transparent z-0" />}
                <div className="relative z-10 border border-white/10 bg-white/5 rounded-2xl p-8 hover:border-[#9333EA]/40 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#9333EA]/20 to-[#EC4899]/20 border border-[#9333EA]/30 flex items-center justify-center text-[#9333EA]">{step.icon}</div>
                    <span className="text-6xl font-black text-white/5 select-none">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-white/50 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <p className="text-[#9333EA] font-semibold text-sm uppercase tracking-widest mb-4">Built for Pros</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5">Everything you need at the bowl</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "AI Photo Analysis", desc: "See what the eye sometimes misses. Our AI detects hair level, tone, porosity, and condition from a single photo. It flags safety concerns — metallic dye, henna, previous chemical treatments — before they become problems.", icon: "🧠" },
              { title: "Precision Formulation", desc: "The right formula, every time. ColorGenius calculates the exact shade mix, developer volume, and processing time based on 10+ variables — including your client's unique hair history and specific color line.", icon: "🎯" },
              { title: "Result Scoring & Learning", desc: "Every formulation makes the next one better. Our AI compares before and after photos, scoring color accuracy, hair condition, and application evenness — learning from real-world results.", icon: "📊" },
              { title: "Client History & Safety", desc: "Never start from scratch. Every client's questionnaire, photo, formulation, and result is saved to their profile. Complete color history one tap away — including safety flags.", icon: "🔒" },
              { title: "Smart Questionnaire", desc: "Catch what matters before it's too late. Pre-formulation questionnaire covers treatment history, allergies, texture, and desired outcomes. The AI uses every answer to refine its recommendation.", icon: "📋" },
              { title: "Multi-Line Support", desc: "Redken, Wella, Schwarzkopf, Davines, L'Oréal Professionnel at launch. Formulations respect each brand's unique mixing ratios, developer systems, and processing times.", icon: "🏪" },
            ].map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                className="border border-white/10 bg-white/5 rounded-2xl p-6 hover:border-[#9333EA]/30 transition-colors">
                <span className="text-2xl mb-4 block">{feature.icon}</span>
                <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <p className="text-[#9333EA] font-semibold text-sm uppercase tracking-widest mb-4">Free During Beta</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5">$0 through August 2026</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">We're building this with stylists, for stylists. Beta is free because your feedback makes the product better.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: "Professional", price: "$29", period: "/mo", desc: "Individual stylists", features: ["Unlimited formulations", "8+ color lines", "AI learning system"], highlight: false },
              { name: "Pro+", price: "$49", period: "/mo", desc: "Power users", features: ["All brands", "Advanced AI", "Priority support"], highlight: false },
              { name: "Salon", price: "$149", period: "/mo", desc: "Teams of 5", features: ["5 seats", "Team analytics", "Client management"], highlight: true },
              { name: "Salon+", price: "$299", period: "/mo", desc: "Larger teams", features: ["15 seats", "Inventory integration", "Custom reporting"], highlight: false },
            ].map((tier, i) => (
              <motion.div key={tier.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 border ${tier.highlight ? 'border-[#9333EA]/50 bg-[#9333EA]/10' : 'border-white/10 bg-white/5'}`}>
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                )}
                <h3 className="text-base font-bold text-white">{tier.name}</h3>
                <div className="mt-3 mb-1">
                  <span className="text-3xl font-black text-white">{tier.price}</span>
                  <span className="text-white/40 text-sm">{tier.period}</span>
                </div>
                <p className="text-xs text-white/50 mb-4">{tier.desc}</p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map(f => (
                    <li key={f} className="text-xs text-white/60 flex items-center gap-2"><span className="text-[#9333EA]">✓</span> {f}</li>
                  ))}
                </ul>
                <p className="text-[10px] text-white/30 italic">After beta · Beta testers lock in permanent discount</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <p className="text-[#9333EA] font-semibold text-sm uppercase tracking-widest mb-4">From Our Beta Stylists</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5">Built by stylists, for stylists.</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "This is what I've been waiting for — a tool that actually understands color theory and gives me confidence at the bowl.", author: "Beta Stylist" },
              { quote: "I've been doing hair for 15 years and I still get corrective color wrong sometimes. ColorGenius catches things I might miss.", author: "Beta Stylist" },
              { quote: "Finally, someone built tech for us — not for consumers playing with filters.", author: "Beta Stylist" },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                className="border border-white/10 bg-white/5 rounded-2xl p-6">
                <p className="text-white/70 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <p className="text-white/40 text-xs font-semibold">— {t.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <p className="text-[#9333EA] font-semibold text-sm uppercase tracking-widest mb-4">Common Questions</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5">FAQ</h2>
          </motion.div>
          <div className="space-y-4">
            {[
              { q: "Is ColorGenius only for new stylists?", a: "No. ColorGenius helps stylists at every level — from recent graduates building confidence to veterans handling complex corrective color. The AI adapts to your experience." },
              { q: "Which color lines do you support?", a: "Redken, Wella, Schwarzkopf, Davines, and L'Oréal Professionnel at launch, with more lines added based on demand." },
              { q: "Does it replace my color training?", a: "ColorGenius is a tool, not a teacher. It handles the calculation so you can focus on the art. Think of it as a calculator for colorists." },
              { q: "Is client data secure?", a: "Yes. All photos and client data are encrypted and never shared. We use anonymized formulation data to improve the AI — no personal information." },
              { q: "How accurate is the photo analysis?", a: "90%+ accuracy on well-lit, properly taken photos. Best results come from natural daylight near a window." },
              { q: "How much does beta cost?", a: "Completely free. Unlimited formulations, all supported color lines, full features. Beta testers get a lifetime discount on future paid plans." },
            ].map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.05 }}
                className="border border-white/10 bg-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#9333EA] to-[#EC4899] flex items-center justify-center mx-auto mb-8">
              <span className="text-white font-black text-xl">CG</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Your next great formulation starts here.</h2>
            <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto">
              Join 50 founding stylists shaping the future of professional hair color. Free during beta. No credit card required.
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-bold text-base px-10 py-4 rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-[#9333EA]/25">
              Join the Beta
            </button>
            <p className="text-white/25 text-xs mt-4">No spam. No credit card. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#9333EA] to-[#EC4899] flex items-center justify-center">
              <span className="text-white font-black text-xs">CG</span>
            </div>
            <span className="text-white/40 text-sm font-medium">ColorGenius · AI Hair Color Formulation for Professionals</span>
          </div>
          <p className="text-white/25 text-xs">© 2026 ColorGenius Inc. — All rights reserved. Made with 🎨 for the salon industry.</p>
          <div className="flex gap-6 text-white/30 text-xs">
            <a href="/privacy" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
