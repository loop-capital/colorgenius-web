'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, ChevronDown, ChevronUp, FlaskConical, Droplets,
  Thermometer, Scissors, Clock, ShieldCheck, Sparkles, Wrench,
  ChevronRight, BookOpen, Zap, AlertCircle
} from 'lucide-react'
import { diagnose, prioritizeIssues, type CorrectiveIssue, type HairState } from './engine'

interface Props {
  hairState: HairState
  onApplyFix?: (fix: CorrectiveIssue) => void
  compact?: boolean
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    mild: '#10B981',
    moderate: '#F59E0B',
    severe: '#EF4444',
  }
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      padding: '3px 8px',
      borderRadius: 6,
      background: `${colors[severity]}15`,
      color: colors[severity],
      border: `1px solid ${colors[severity]}30`,
    }}>
      {severity}
    </span>
  )
}

function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, React.ReactNode> = {
    lift: <Zap size={14} />,
    tone: <Droplets size={14} />,
    damage: <AlertTriangle size={14} />,
    application: <Thermometer size={14} />,
    filler: <FlaskConical size={14} />,
  }
  return <span style={{ color: '#9333EA' }}>{icons[category] || <Sparkles size={14} />}</span>
}

function CorrectiveCard({ issue, index, onApply }: { issue: CorrectiveIssue; index: number; onApply?: () => void }) {
  const [expanded, setExpanded] = useState(index === 0)
  const [activeTab, setActiveTab] = useState<'cause' | 'strategy' | 'formulas' | 'care'>('strategy')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(22,22,32,0.6)',
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: issue.severity === 'severe' ? 'rgba(239,68,68,0.1)' : issue.severity === 'moderate' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <CategoryIcon category={issue.category} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7' }}>{issue.name}</span>
            <SeverityBadge severity={issue.severity} />
          </div>
          <p style={{ fontSize: 12, color: '#71717A', margin: 0 }}>{issue.visualSigns.slice(0, 2).join(' · ')}</p>
        </div>
        <div style={{ color: '#71717A' }}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 20px' }}>
              {/* Tabs */}
              <div style={{
                display: 'flex',
                gap: 4,
                marginBottom: 16,
                padding: 4,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.03)',
              }}>
                {(['strategy', 'formulas', 'cause', 'care'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      border: 'none',
                      cursor: 'pointer',
                      background: activeTab === tab ? 'rgba(147,51,234,0.15)' : 'transparent',
                      color: activeTab === tab ? '#9333EA' : '#71717A',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'strategy' && (
                <div>
                  <div style={{
                    padding: 14,
                    borderRadius: 12,
                    background: 'rgba(147,51,234,0.05)',
                    border: '1px solid rgba(147,51,234,0.1)',
                    marginBottom: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <ShieldCheck size={14} style={{ color: '#9333EA' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9333EA' }}>Neutralization Strategy</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.6, margin: 0 }}>{issue.neutralizationStrategy}</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Wrench size={14} style={{ color: '#F59E0B' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#F59E0B' }}>Processing Notes</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {issue.processingNotes.map((note, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: 'rgba(245,158,11,0.1)',
                          color: '#F59E0B',
                          fontSize: 10,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 2,
                        }}>
                          {i + 1}
                        </span>
                        <p style={{ fontSize: 12, color: '#A1A1AA', lineHeight: 1.5, margin: 0 }}>{note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'formulas' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {issue.suggestedFormulas.map((formula, fi) => (
                    <div key={fi} style={{
                      padding: 14,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <FlaskConical size={14} style={{ color: '#14b8a6' }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#F5F5F7' }}>{formula.name}</span>
                        <span style={{ fontSize: 10, color: '#14b8a6', marginLeft: 'auto' }}>{formula.processingTime}</span>
                      </div>
                      <p style={{ fontSize: 11, color: '#71717A', marginBottom: 10 }}>{formula.purpose}</p>

                      {/* Products */}
                      {formula.products.map((p, pi) => (
                        <div key={pi} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 10px',
                          borderRadius: 8,
                          background: 'rgba(147,51,234,0.05)',
                          marginBottom: 6,
                        }}>
                          <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#9333EA',
                            flexShrink: 0,
                          }} />
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#F5F5F7' }}>{p.brand} {p.shade}</span>
                            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                              <span style={{ fontSize: 10, color: '#71717A' }}>Dev: {p.developer}</span>
                              <span style={{ fontSize: 10, color: '#71717A' }}>Ratio: {p.ratio}</span>
                              <span style={{ fontSize: 10, color: '#71717A' }}>Amt: {p.amount}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div style={{ marginTop: 8 }}>
                        <span style={{ fontSize: 10, color: '#71717A', fontWeight: 600 }}>Sectioning: </span>
                        <span style={{ fontSize: 10, color: '#A1A1AA' }}>{formula.sectioning}</span>
                      </div>

                      {formula.notes.length > 0 && (
                        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {formula.notes.map((n, ni) => (
                            <span key={ni} style={{
                              fontSize: 10,
                              color: '#F59E0B',
                              background: 'rgba(245,158,11,0.08)',
                              padding: '3px 8px',
                              borderRadius: 6,
                            }}>
                              {n}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {onApply && (
                    <button
                      onClick={onApply}
                      style={{
                        padding: '10px 16px',
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #9333EA, #EC4899)',
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        marginTop: 4,
                      }}
                    >
                      <Sparkles size={14} />
                      Apply This Fix to Formula
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'cause' && (
                <div>
                  <div style={{ marginBottom: 14 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#EF4444', display: 'block', marginBottom: 6 }}>Root Cause</span>
                    <p style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.6, margin: 0 }}>{issue.rootCause}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#71717A', display: 'block', marginBottom: 6 }}>Visual Signs</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {issue.visualSigns.map((sign, i) => (
                        <span key={i} style={{
                          fontSize: 11,
                          color: '#A1A1AA',
                          background: 'rgba(255,255,255,0.04)',
                          padding: '4px 10px',
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                          {sign}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'care' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <BookOpen size={14} style={{ color: '#14b8a6' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#14b8a6' }}>At-Home Maintenance</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {issue.homeCare.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <Droplets size={12} style={{ color: '#14b8a6', flexShrink: 0, marginTop: 3 }} />
                        <p style={{ fontSize: 12, color: '#A1A1AA', lineHeight: 1.5, margin: 0 }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Compact inline badge for use in results step
export function CorrectiveBadge({ issue }: { issue: CorrectiveIssue }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 8px',
      borderRadius: 6,
      fontSize: 10,
      fontWeight: 600,
      background: issue.severity === 'severe' ? 'rgba(239,68,68,0.1)' : issue.severity === 'moderate' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
      color: issue.severity === 'severe' ? '#EF4444' : issue.severity === 'moderate' ? '#F59E0B' : '#10B981',
      border: `1px solid ${issue.severity === 'severe' ? 'rgba(239,68,68,0.2)' : issue.severity === 'moderate' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
    }}>
      <AlertTriangle size={10} />
      {issue.name}
    </span>
  )
}

export default function CorrectiveColorPanel({ hairState, onApplyFix, compact }: Props) {
  const issues = prioritizeIssues(diagnose(hairState))

  if (issues.length === 0) return null

  if (compact) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {issues.map(issue => (
          <CorrectiveBadge key={issue.id} issue={issue} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #EF4444, #F59E0B)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <AlertTriangle size={16} color="#fff" />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>Corrective Color Needed</h3>
          <p style={{ fontSize: 12, color: '#71717A', margin: '2px 0 0' }}>{issues.length} issue{issues.length > 1 ? 's' : ''} detected · Fix in recommended order</p>
        </div>
      </div>

      <div>
        {issues.map((issue, i) => (
          <CorrectiveCard
            key={issue.id}
            issue={issue}
            index={i}
            onApply={onApplyFix ? () => onApplyFix(issue) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
