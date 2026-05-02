'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';

interface PricingTier {
  name: string;
  icon: React.ReactNode;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

const tiers: PricingTier[] = [
  {
    name: 'Starter',
    icon: <Sparkles className="w-6 h-6" />,
    price: 29,
    period: '/month',
    description: 'Perfect for individual stylists getting started with AI color matching.',
    features: [
      '50 hair scans per month',
      'Basic color matching',
      'Email support',
      'Mobile app access',
      'Standard processing',
    ],
  },
  {
    name: 'Professional',
    icon: <Zap className="w-6 h-6" />,
    price: 79,
    period: '/month',
    description: 'For busy salons and experienced colorists who need more power.',
    features: [
      'Unlimited hair scans',
      'Advanced AI matching',
      'Priority email & chat support',
      'Custom formula library',
      'Client profiles & history',
      'Export to salon software',
      'Team collaboration (up to 3)',
    ],
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    icon: <Crown className="w-6 h-6" />,
    price: 199,
    period: '/month',
    description: 'For multi-location salons and color education institutions.',
    features: [
      'Everything in Professional',
      'Unlimited team members',
      'Custom AI model training',
      'API access',
      'White-label options',
      'Dedicated account manager',
      'Advanced analytics',
      'SLA guarantee',
    ],
  },
];

export function ColorgeniusPricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const getPrice = (basePrice: number) => {
    return isAnnual ? Math.round(basePrice * 0.8) : basePrice;
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Choose the plan that works for your salon. All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 bg-gray-100 rounded-full">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                !isAnnual
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                isAnnual
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Annual
              <span className="ml-1.5 text-xs text-indigo-600 font-semibold">Save 20%</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className={cn(
                'relative rounded-2xl p-8 transition-all duration-300',
                tier.highlighted
                  ? 'bg-gradient-to-b from-indigo-50 to-white border-2 border-indigo-200 shadow-xl shadow-indigo-100/50'
                  : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'
              )}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg">
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                tier.highlighted
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              )}>
                {tier.icon}
              </div>

              {/* Name */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-6">{tier.description}</p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    ${getPrice(tier.price)}
                  </span>
                  <span className="text-gray-500">{tier.period}</span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-indigo-600 mt-1">
                    Billed annually (${getPrice(tier.price) * 12}/year)
                  </p>
                )}
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 mb-6',
                  tier.highlighted
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                )}
              >
                Start Free Trial
              </motion.button>

              {/* Features */}
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      tier.highlighted ? 'bg-indigo-100' : 'bg-gray-100'
                    )}>
                      <Check className={cn(
                        'w-3 h-3',
                        tier.highlighted ? 'text-indigo-600' : 'text-gray-600'
                      )} />
                    </div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* FAQ Link */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12 text-gray-600"
        >
          Have questions?{' '}
          <a href="#faq" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Check our FAQ
          </a>{' '}
          or{' '}
          <a href="#contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
            contact us
          </a>
        </motion.p>
      </div>
    </section>
  );
}

export default ColorgeniusPricing;
