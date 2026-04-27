"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0A0A1A]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-black text-sm">CG</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">ColorGenius</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <a
          href="#pricing"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
        >
          Get Early Access
        </a>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-pink-500/15 blur-[100px] pointer-events-none" />

      <motion.div style={{ y, opacity }} className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Now in private beta — 2,400+ stylists on waitlist
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6"
        >
          Stop guessing.
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Start formulating.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Snap a photo of any hair color. ColorGenius returns a precise formula
          from 10+ professional color lines — Redken, Wella, Schwarzkopf, Goldwell, and more.
          Built for stylists who want accuracy without the chair time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#pricing"
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-base px-8 py-4 rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
          >
            Join the Waitlist — Free
          </a>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto border border-white/20 text-white/80 font-semibold text-base px-8 py-4 rounded-full hover:bg-white/5 transition-colors"
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
              <div
                key={i}
                className="w-9 h-9 rounded-full border-2 border-[#0A0A1A] flex items-center justify-center text-xs font-bold"
                style={{ background: color }}
              >
                {["JD", "SM", "AK", "TR", "LM"][i]}
              </div>
            ))}
          </div>
          <p className="text-white/40 text-sm">
            Trusted by stylists at{" "}
            <span className="text-white/60 font-medium">Paul Labrecque, Bumble & Bumble,</span> and
            independents nationwide
          </p>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 border-white/20 flex justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Snap a Photo",
      description:
        "Take a clear, well-lit photo of your client's current hair — wet or dry. Our AI handles the rest.",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "AI Color Analysis",
      description:
        "ColorGenius maps 47 distinct color dimensions — depth, tone, reflectivity, underlying pigment — in under 2 seconds.",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Get Your Formula",
      description:
        "Receive a precise formula card for your client's target color — brand-specific, mixing ratios and all. Ready to use at the bowl.",
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-4">
            Simple by Design
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
            Three steps. Zero guesswork.
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            From photo to formula in under 30 seconds. Built to slot into your
            existing workflow, not replace it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative group"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 left-full w-full h-px bg-gradient-to-r from-purple-500/40 to-transparent z-0" />
              )}

              <div className="relative z-10 border border-white/10 bg-white/5 rounded-2xl p-8 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    {step.icon}
                  </div>
                  <span className="text-6xl font-black text-white/5 select-none">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/50 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      title: "10+ Color Lines",
      description:
        "Wella, Redken, Schwarzkopf, Goldwell, Matrix, Paul Mitchell, Keune, Pulpria, and more — updated with each new product launch.",
      icon: "🎨",
    },
    {
      title: "Tonal Precision",
      description:
        "Maps 47 color dimensions including depth, tone, reflectivity, and underlying pigment to eliminate brassiness before it starts.",
      icon: "⚡",
    },
    {
      title: "Oxidative Timing",
      description:
        "Built-in timing guidance for all formulas — developed with color chemists from Wella and Schwarzkopf Professional.",
      icon: "⏱",
    },
    {
      title: "Client History",
      description:
        "Every formula saved to your client profile. Track what worked, revisit past colors, and rebook with one tap.",
      icon: "📋",
    },
    {
      title: "Color Corrections",
      description:
        "Not just formulas — ColorGenius identifies the underlying pigment you're fighting and tells you exactly how to neutralize it.",
      icon: "🔧",
    },
    {
      title: "Try Before You Tie",
      description:
        "AR preview lets clients see their potential color before committing. Fewer regrets. More upsells. Higher satisfaction.",
      icon: "👁",
    },
  ];

  return (
    <section id="features" className="py-32 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-4">
            Built for the Chair
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
            Everything a colorist needs.
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Not a basic color picker. A full formulation engine built from 100+
            years of professional color science.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="border border-white/10 bg-white/5 rounded-2xl p-7 hover:border-purple-500/30 transition-colors"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "For independent stylists getting started with AI color.",
      features: [
        "50 formulations/month",
        "3 color lines (Wella, Redken, Schwarzkopf)",
        "Client history (up to 50 clients)",
        "Email support",
      ],
      cta: "Join Waitlist",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$59",
      period: "/month",
      description: "For working stylists who color full-time.",
      features: [
        "Unlimited formulations",
        "10+ professional color lines",
        "Unlimited client history",
        "Color correction protocols",
        "AR try-before-you-tie preview",
        "Priority support",
      ],
      cta: "Join Waitlist",
      highlight: true,
    },
    {
      name: "Salon",
      price: "$149",
      period: "/month",
      description: "For salon owners managing a team of colorists.",
      features: [
        "Everything in Pro",
        "Up to 10 team seats",
        "Team formulation library",
        "Admin dashboard & analytics",
        "Custom color line onboarding",
        "Dedicated account manager",
      ],
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-32 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-purple-400 font-semibold text-sm uppercase tracking-widest mb-4">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
            Pay for what you use.
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            All plans include a 14-day free trial. No credit card required to
            join the waitlist.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`relative rounded-2xl p-8 ${
                tier.highlight
                  ? "border-2 border-purple-500 bg-gradient-to-b from-purple-500/10 to-pink-500/5"
                  : "border border-white/10 bg-white/5"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">{tier.price}</span>
                  <span className="text-white/40 text-sm">{tier.period}</span>
                </div>
                <p className="text-white/50 text-sm mt-2">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                    <svg className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`block w-full text-center font-bold text-base py-3.5 rounded-full transition-all ${
                  tier.highlight
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                    : "border border-white/20 text-white/80 hover:bg-white/5"
                }`}
              >
                {tier.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-32 px-6 border-t border-white/5">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-8">
            <span className="text-white font-black text-xl">CG</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to color smarter?
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto">
            Join 2,400+ stylists on the waitlist. Early access members get 3
            months at 50% off — locked in forever.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="your@salon.com"
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-5 py-3.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Get Early Access
            </button>
          </form>
          <p className="text-white/25 text-xs mt-4">
            No spam. No credit card. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-black text-xs">CG</span>
          </div>
          <span className="text-white/40 text-sm font-medium">ColorGenius</span>
        </div>
        <p className="text-white/25 text-xs">
          © 2026 ColorGenius Inc. — All rights reserved.
        </p>
        <div className="flex gap-6 text-white/30 text-xs">
          <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
          <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
          <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="bg-[#0A0A1A] min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
