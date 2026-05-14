'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Check, Sparkles, Zap, Crown } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for independent stylists',
    icon: Sparkles,
    features: [
      'Unlimited formulations',
      'Basic inventory tracking',
      'Client management (50 clients)',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$79',
    period: '/month',
    description: 'For growing salons',
    icon: Zap,
    features: [
      'Everything in Starter',
      'Unlimited clients',
      'Scale integration',
      'Formula marketplace access',
      'Priority support',
      'Team sharing (3 seats)',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Salon',
    price: '$199',
    period: '/month',
    description: 'Full salon management',
    icon: Crown,
    features: [
      'Everything in Pro',
      'Unlimited team seats',
      'Advanced analytics',
      'White-label options',
      'API access',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)

  useEffect(() => {
    // Check current plan from user profile
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => setCurrentPlan(d?.user?.plan || null))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen p-6" style={{ background: '#0A0A0F' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3" style={{ color: '#F5F5F7' }}>
            Choose Your <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Plan</span>
          </h1>
          <p className="text-base" style={{ color: '#A1A1AA' }}>
            Scale your salon with the right tools
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-xl p-1" style={{ background: '#161620', border: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'text-white'
                  : 'text-[#A1A1AA] hover:text-[#F5F5F7]'
              }`}
              style={billingCycle === 'monthly' ? { background: 'linear-gradient(135deg, #9333EA, #EC4899)' } : {}}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'text-white'
                  : 'text-[#A1A1AA] hover:text-[#F5F5F7]'
              }`}
              style={billingCycle === 'yearly' ? { background: 'linear-gradient(135deg, #9333EA, #EC4899)' } : {}}
            >
              Yearly <span className="text-[10px] ml-1 opacity-80">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl p-6 flex flex-col"
              style={{
                background: plan.popular ? 'linear-gradient(180deg, rgba(147,51,234,0.1), rgba(236,72,153,0.05))' : '#161620',
                border: plan.popular ? '1px solid rgba(147,51,234,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)' }}>
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)' }}>
                  <plan.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: '#F5F5F7' }}>{plan.name}</h3>
                  <p className="text-xs" style={{ color: '#A1A1AA' }}>{plan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold" style={{ color: '#F5F5F7' }}>
                  {billingCycle === 'yearly' ? plan.price.replace('$', '$') : plan.price}
                </span>
                <span className="text-sm" style={{ color: '#A1A1AA' }}>{plan.period}</span>
                {billingCycle === 'yearly' && (
                  <p className="text-xs mt-1" style={{ color: '#10B981' }}>
                    Billed annually
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm" style={{ color: '#A1A1AA' }}>
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#10B981' }} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                style={
                  plan.popular
                    ? { background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#F5F5F7' }
                }
                onClick={() => {
                  // TODO: Integrate with Stripe/Square
                  alert('Payment integration coming soon!')
                }}
              >
                {currentPlan === plan.name.toLowerCase() ? 'Current Plan' : plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm" style={{ color: '#71717A' }}>
            All plans include a 14-day free trial. No credit card required.
          </p>
          <Link href="/dashboard" className="inline-block mt-4 text-sm font-medium hover:underline"
            style={{ color: '#9333EA' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
