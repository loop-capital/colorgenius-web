'use client'

import { Heart, Sparkles, Droplets, ShieldCheck, ShieldAlert, ExternalLink } from 'lucide-react'
import type { HairProfile, SensitivitySnapshot, LastServiceOption } from '@/lib/client-profile'

interface HairProfileCardProps {
  profile: HairProfile
  onEdit?: () => void
}

export function HairProfileCard({ profile, onEdit }: HairProfileCardProps) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(30,30,45,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
          <Heart size={14} className="text-[#EC4899]" />
          Hair Profile
        </h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-xs text-[#9333EA] hover:text-[#A855F7] transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {/* Hair Characteristics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <ProfileField label="Texture" value={profile.texture} />
        <ProfileField label="Pattern" value={profile.hairPattern} />
        <ProfileField label="Density" value={profile.density} />
        <ProfileField label="Porosity" value={profile.porosity} />
        <ProfileField
          label="Natural Level"
          value={profile.naturalLevel ? `Level ${profile.naturalLevel}` : null}
        />
        <ProfileField label="Natural Tone" value={profile.naturalTone} />
        <ProfileField label="Scalp" value={profile.scalpCondition} span={2} />
      </div>

      {/* Chemical History */}
      {profile.chemicalHistory && (
        <div className="mb-4">
          <h4 className="text-[11px] uppercase tracking-wider font-semibold text-white/30 mb-2">
            Chemical History
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.chemicalHistory.boxDye && (
              <HistoryBadge label="Box Dye" danger />
            )}
            {profile.chemicalHistory.metallicSalts && (
              <HistoryBadge label="Metallic Salts" danger />
            )}
            {profile.chemicalHistory.henna && (
              <HistoryBadge label="Henna" danger />
            )}
            {profile.chemicalHistory.keratinTreatment && (
              <HistoryBadge label="Keratin" warning />
            )}
            {profile.chemicalHistory.relaxer && (
              <HistoryBadge label="Relaxer" warning />
            )}
            {profile.chemicalHistory.hardWater && (
              <HistoryBadge label="Hard Water" neutral />
            )}
            {profile.chemicalHistory.medicationBuildup && (
              <HistoryBadge label="Med Buildup" neutral />
            )}
            <HistoryBadge
              label={`Last: ${formatLastService(profile.chemicalHistory.lastService)}`}
              neutral
            />
          </div>
        </div>
      )}

      {/* Sensitivities */}
      {profile.sensitivities && hasAnySensitivity(profile.sensitivities) && (
        <div className="mb-4">
          <h4 className="text-[11px] uppercase tracking-wider font-semibold text-white/30 mb-2">
            Sensitivities
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.sensitivities.ppdAllergy && (
              <SensitivityBadge label="PPD Allergy" />
            )}
            {profile.sensitivities.ammoniaSensitivity && (
              <SensitivityBadge label="Ammonia" />
            )}
            {profile.sensitivities.fragranceSensitivity && (
              <SensitivityBadge label="Fragrance" />
            )}
            {profile.sensitivities.isPregnant && (
              <SensitivityBadge label="Pregnant" />
            )}
            {profile.sensitivities.isBreastfeeding && (
              <SensitivityBadge label="Breastfeeding" />
            )}
            {profile.sensitivities.activeChemo && (
              <SensitivityBadge label="Active Chemo" danger />
            )}
            {profile.sensitivities.other?.map((o) => (
              <SensitivityBadge key={o} label={o} />
            ))}
          </div>
        </div>
      )}

      {/* Last Observed */}
      {(profile.lastObservedLevel || profile.lastObservedTone) && (
        <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <p className="text-[11px] text-white/30">
            Last formulated:{" "}
            {profile.lastServiceDate
              ? new Date(profile.lastServiceDate).toLocaleDateString()
              : 'Unknown'}
            {profile.lastObservedLevel && ` · Level ${profile.lastObservedLevel}`}
            {profile.lastObservedTone && ` ${profile.lastObservedTone}`}
          </p>
        </div>
      )}

      {/* Product Recommendations */}
      <ProductRecommendations profile={profile} />

      {/* Maintenance Tips */}
      <MaintenanceTips profile={profile} />

      {/* Notes */}
      {profile.notes && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <p className="text-xs text-white/50 italic">&ldquo;{profile.notes}&rdquo;</p>
        </div>
      )}
    </div>
  )
}

/* ───── Product Recommendations ───── */

interface ProductRec {
  name: string
  reason: string
  icon: React.ReactNode
  link: string
}

function getProductRecommendations(profile: HairProfile): ProductRec[] {
  const recs: ProductRec[] = []

  if (profile.porosity === 'low') {
    recs.push({
      name: 'Protein Treatment',
      reason: 'Low porosity hair needs protein to strengthen cuticle layers',
      icon: <ShieldAlert size={14} className="text-[#EAB308]" />,
      link: '#protein-treatment',
    })
  }
  if (profile.porosity === 'high') {
    recs.push({
      name: 'Moisture Treatment',
      reason: 'High porosity hair loses moisture quickly — seal it in',
      icon: <Droplets size={14} className="text-[#3B82F6]" />,
      link: '#moisture-treatment',
    })
  }
  if (profile.chemicalHistory?.boxDye || profile.chemicalHistory?.henna) {
    recs.push({
      name: 'Bond Builder',
      reason: 'Previous chemical damage detected — rebuild bonds before next service',
      icon: <Sparkles size={14} className="text-[#EC4899]" />,
      link: '#bond-builder',
    })
  }
  if (profile.lastObservedLevel || profile.lastObservedTone) {
    recs.push({
      name: 'Color-Safe Shampoo',
      reason: 'Preserve your color longer with sulfate-free formula',
      icon: <Sparkles size={14} className="text-[#9333EA]" />,
      link: '#color-safe-shampoo',
    })
  }

  return recs.slice(0, 3)
}

function ProductRecommendations({ profile }: { profile: HairProfile }) {
  const recs = getProductRecommendations(profile)
  if (recs.length === 0) return null

  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
      <h4 className="text-[11px] uppercase tracking-wider font-semibold text-white/30 mb-2">
        Recommended Products
      </h4>
      <div className="space-y-2">
        {recs.map((rec) => (
          <div
            key={rec.name}
            className="flex items-start gap-2.5 rounded-lg p-2.5"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="mt-0.5">{rec.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/80">{rec.name}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{rec.reason}</p>
            </div>
            <a
              href={rec.link}
              className="shrink-0 text-white/30 hover:text-white/60 transition-colors"
              title="View product"
            >
              <ExternalLink size={12} />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───── Maintenance Tips ───── */

interface Tip {
  text: string
}

function getMaintenanceTips(profile: HairProfile): Tip[] {
  const tips: Tip[] = []

  if (profile.lastObservedLevel && profile.lastObservedTone) {
    tips.push({
      text: `Use sulfate-free shampoo for Level ${profile.lastObservedLevel} ${profile.lastObservedTone}`,
    })
  }

  if (profile.porosity) {
    tips.push({
      text: `Deep condition weekly for ${profile.porosity} porosity`,
    })
  }

  if (profile.lastServiceDate) {
    const lastDate = new Date(profile.lastServiceDate)
    const daysSince = Math.ceil((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    const weeksSince = Math.floor(daysSince / 7)
    const touchUpIn = Math.max(1, 6 - weeksSince)
    tips.push({
      text: `Touch-up recommended in ${touchUpIn} week${touchUpIn > 1 ? 's' : ''} (last service ${weeksSince} week${weeksSince !== 1 ? 's' : ''} ago)`,
    })
  }

  if (profile.scalpCondition === 'dry') {
    tips.push({ text: 'Use a scalp oil treatment before washing' })
  }
  if (profile.scalpCondition === 'oily') {
    tips.push({ text: 'Clarify scalp every 2 weeks to balance oil production' })
  }

  return tips.slice(0, 3)
}

function MaintenanceTips({ profile }: { profile: HairProfile }) {
  const tips = getMaintenanceTips(profile)
  if (tips.length === 0) return null

  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
      <h4 className="text-[11px] uppercase tracking-wider font-semibold text-white/30 mb-2">
        Maintenance Tips
      </h4>
      <ul className="space-y-1.5">
        {tips.map((tip, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-white/60">
            <span className="text-[var(--cg-accent)] mt-0.5">•</span>
            <span>{tip.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ───── sub-components ───── */

function ProfileField({
  label,
  value,
  span = 1,
}: {
  label: string
  value: string | number | null
  span?: number
}) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className={span > 1 ? `col-span-${span}` : ''}>
      <p className="text-[10px] uppercase tracking-wider text-white/30 mb-0.5">{label}</p>
      <p className="text-sm text-white/80 capitalize">{value}</p>
    </div>
  )
}

function HistoryBadge({
  label,
  danger,
  warning,
  neutral,
}: {
  label: string
  danger?: boolean
  warning?: boolean
  neutral?: boolean
}) {
  const colors = danger
    ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
    : warning
      ? 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/20'
      : 'bg-white/5 text-white/50 border-white/10'
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colors}`}>{label}</span>
  )
}

function SensitivityBadge({ label, danger }: { label: string; danger?: boolean }) {
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full border ${
        danger
          ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
          : 'bg-[#9333EA]/10 text-[#9333EA] border-[#9333EA]/20'
      }`}
    >
      {label}
    </span>
  )
}

function formatLastService(s: LastServiceOption | undefined): string {
  if (!s) return 'Unknown'
  return s
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
}

function hasAnySensitivity(s: SensitivitySnapshot): boolean {
  return (
    s.ppdAllergy ||
    s.ammoniaSensitivity ||
    s.fragranceSensitivity ||
    s.isPregnant ||
    s.isBreastfeeding ||
    s.activeChemo ||
    (s.other?.length ?? 0) > 0
  )
}
