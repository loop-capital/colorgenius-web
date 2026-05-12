'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Palette, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BrandInfo {
  id: string;
  name: string;
  tagline: string;
  totalShades: number;
  lines: string[];
  swatches: string[]; // hex colours
}

/* ------------------------------------------------------------------ */
/*  Static brand catalogue  (imported at build time)                    */
/* ------------------------------------------------------------------ */

const BRANDS: BrandInfo[] = [
  {
    id: 'davines',
    name: 'Davines',
    tagline: 'Sustainable beauty from Parma, Italy',
    totalShades: 43,
    lines: ['View', 'A New Colour', 'Mask with Vibrachrom'],
    swatches: ['#1a1a1a', '#5c2a2a', '#b86b3e', '#d4a574'],
  },
  {
    id: 'lanza',
    name: "L'ANZA",
    tagline: 'Healing Color with Keratin Therapy',
    totalShades: 109,
    lines: ['Healing Color Cream'],
    swatches: ['#0d0d0d', '#6b4c3d', '#c49a6c', '#e8d5c4'],
  },
  {
    id: 'redken',
    name: 'Redken',
    tagline: 'Professional haircolor & care',
    totalShades: 86,
    lines: ['Color Gels', 'Shades EQ', 'Chromatics'],
    swatches: ['#141414', '#7a2e2e', '#c46b3a', '#f0c0a0'],
  },
  {
    id: 'goldwell',
    name: 'Goldwell',
    tagline: 'German-engineered color performance',
    totalShades: 92,
    lines: ['Topchic', 'Colorance', 'Nectaya'],
    swatches: ['#1f1f1f', '#5e3a2a', '#a86e4e', '#dcbfa0'],
  },
  {
    id: 'schwarzkopf',
    name: 'Schwarzkopf',
    tagline: 'True professional color since 1898',
    totalShades: 120,
    lines: ['Igora Royal', 'Igora Vibrance', 'BlondMe'],
    swatches: ['#111111', '#4a2a2a', '#b86b4e', '#f5dcc8'],
  },
  {
    id: 'matrix',
    name: 'Matrix',
    tagline: 'Designed for the digital generation',
    totalShades: 78,
    lines: ['SoColor', 'Color Sync', 'SoColor Cult'],
    swatches: ['#161616', '#6b3a3a', '#c47a4e', '#e8c8b0'],
  },
  {
    id: 'joico',
    name: 'Joico',
    tagline: 'The joi of healthy hair',
    totalShades: 64,
    lines: ['LumiShine', 'Vero K-PAK'],
    swatches: ['#1a1a1a', '#5c3a2a', '#b87a5e', '#dcc0a8'],
  },
  {
    id: 'paul-mitchell',
    name: 'Paul Mitchell',
    tagline: 'Salon-quality, cruelty-free',
    totalShades: 56,
    lines: ['The Color', 'PM Shines'],
    swatches: ['#141414', '#6b4a3a', '#c48a6e', '#f0d8c4'],
  },
  {
    id: 'pulp-riot',
    name: 'Pulp Riot',
    tagline: 'Unapologetically bold fashion color',
    totalShades: 48,
    lines: ['FACTION8', 'Semi-Permanent', 'Blush'],
    swatches: ['#ff0066', '#6600ff', '#00ccff', '#ffcc00'],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function useBrandFilter(query: string) {
  const q = query.trim().toLowerCase();
  return useMemo(() => {
    if (!q) return BRANDS;
    return BRANDS.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.tagline.toLowerCase().includes(q) ||
        b.lines.some((l) => l.toLowerCase().includes(q))
    );
  }, [q]);
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function GlassCard({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/20 bg-background/60 backdrop-blur-lg',
        'dark:bg-background/40 dark:border-border/30',
        hover &&
          'transition-all duration-300 hover:bg-background/80 hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  );
}

function SwatchDot({ hex, label }: { hex: string; label?: string }) {
  return (
    <div
      className="w-8 h-8 rounded-full border-2 border-white/80 shadow-sm shrink-0"
      style={{ backgroundColor: hex }}
      title={label || hex}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LibraryPage() {
  const [search, setSearch] = useState('');
  const filtered = useBrandFilter(search);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header ----------------------------------------------------- */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Palette className="w-4 h-4" />
            Pro Reference
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Color Library
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse and search professional hair color shades from leading brands.
            Find the perfect formula for every client.
          </p>
        </div>

        {/* Search bar ------------------------------------------------- */}
        <GlassCard className="max-w-2xl mx-auto mb-10 p-2" hover={false}>
          <div className="flex items-center gap-3 px-4 py-2">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search brands, lines, or shades…"
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
              aria-label="Search brands"
            />
            {search && (
              <span className="text-xs text-muted-foreground shrink-0">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </GlassCard>

        {/* Brand grid ------------------------------------------------- */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((brand) => (
            <Link
              key={brand.id}
              href={`/library/${brand.id}`}
              className="group outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
            >
              <GlassCard className="h-full p-6 flex flex-col">
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {brand.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {brand.tagline}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
                  <span className="font-medium text-foreground">
                    {brand.totalShades}
                  </span>{' '}
                  shades
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                  <span>{brand.lines.length} lines</span>
                </div>

                {/* Swatches */}
                <div className="mt-auto">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    Representative tones
                  </p>
                  <div className="flex items-center gap-2">
                    {brand.swatches.map((hex, i) => (
                      <SwatchDot
                        key={i}
                        hex={hex}
                        label={`${brand.name} tone ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              No brands found
            </h3>
            <p className="text-muted-foreground mt-1">
              Try a different search term.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
