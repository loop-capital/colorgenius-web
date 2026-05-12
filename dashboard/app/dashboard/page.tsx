'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FlaskConical, Users, Camera, BookOpen, History, ArrowRight,
  TrendingUp, UserPlus, Sparkles, Zap, Package, DollarSign,
} from 'lucide-react';
import { ColorGeniusLogo } from '@/components/icons/colorgenius-logo';

const quickActions = [
  { label: 'New Service', href: '/service', icon: Zap, color: '#10B981' },
  { label: 'Formulate', href: '/formulate', icon: FlaskConical, color: '#EC4899' },
  { label: 'Inventory', href: '/dashboard/inventory', icon: Package, color: '#F59E0B' },
  { label: 'Pricing', href: '/dashboard/pricing', icon: DollarSign, color: '#8B5CF6' },
  { label: 'New Consultation', href: '/questionnaire', icon: UserPlus, color: '#9333EA' },
  { label: 'Analyze Hair', href: '/analyze', icon: Camera, color: '#A855F7' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--cg-bg-deep)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--cg-text-primary)' }}>
            Welcome back to <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">ColorGenius</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cg-text-secondary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants}>
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--cg-text-secondary)' }}>Quick Actions</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="rounded-2xl p-4 flex flex-col items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'var(--cg-surface)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${action.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: action.color }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--cg-text-primary)' }}>
                      {action.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Activity placeholder */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium" style={{ color: 'var(--cg-text-secondary)' }}>Recent Activity</p>
              <Link href="/history" className="text-xs flex items-center gap-1" style={{ color: '#9333EA' }}>
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'var(--cg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Sparkles className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--cg-text-tertiary)' }} />
              <p className="text-sm" style={{ color: 'var(--cg-text-tertiary)' }}>
                Your recent formulations will appear here
              </p>
              <Link
                href="/formulate"
                className="inline-flex items-center gap-1 mt-3 text-sm font-medium px-4 py-2 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #9333EA, #EC4899)', color: '#FFF' }}
              >
                <FlaskConical className="w-4 h-4" />
                Create Formula
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
