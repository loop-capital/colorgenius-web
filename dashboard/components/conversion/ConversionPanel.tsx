'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { ConversionResult, MatchType } from '@/lib/conversion/types';

interface ConversionPanelProps {
  formulaShades: Array<{
    shadeCode: string;
    brand: string;
    line: string;
    grams: number;
  }>;
  developerVolume: number;
  currentBrand: string;
  onUseConvertedFormula?: (result: ConversionResult) => void;
}

const CONFIDENCE_COLORS: Record<MatchType, string> = {
  exact: '#22C55E',
  close: '#EAB308',
  'level-adjusted': '#F97316',
  weak: '#EF4444',
};

const CONFIDENCE_LABELS: Record<MatchType, string> = {
  exact: 'Exact',
  close: 'Close',
  'level-adjusted': 'Level-Adjusted',
  weak: 'Weak',
};

const BRAND_DISPLAY_NAMES: Record<string, string> = {
  schwarzkopf: 'Schwarzkopf Professional',
  moroccanoil: 'MoroccanOil',
  lanza: "L'ANZA",
  davines: 'Davines',
  aveda: 'Aveda',
  oligo: 'Oligo Calura',
  lorealpro: "L'Oréal Professionnel",
  kevinmurphy: 'Kevin Murphy COLOR.ME',
  wella: 'Wella Professionals',
  redken: 'Redken',
  joico: 'Joico',
  matrix: 'Matrix',
  pravana: 'Pravana',
  kenra: 'Kenra Professional',
};

export default function ConversionPanel({
  formulaShades,
  developerVolume,
  currentBrand,
  onUseConvertedFormula,
}: ConversionPanelProps) {
  const [targetBrand, setTargetBrand] = useState<string>('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  // Fetch available brands on mount
  useEffect(() => {
    fetch('/api/brands')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setBrands(
            json.data.filter((b: { id: string }) =>
              b.id !== currentBrand.toLowerCase()
            )
          );
        }
      })
      .catch(() => {
        // Fallback to hardcoded list if API fails
        setBrands(
          Object.entries(BRAND_DISPLAY_NAMES)
            .filter(([id]) => id !== currentBrand.toLowerCase())
            .map(([id, name]) => ({ id, name }))
        );
      })
      .finally(() => setBrandsLoading(false));
  }, [currentBrand]);

  const handleConvert = useCallback(async () => {
    if (!targetBrand) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/formulate/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shades: formulaShades,
          targetBrand,
          developerVolume,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Conversion failed');
      }

      setResult(json.data as ConversionResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setLoading(false);
    }
  }, [formulaShades, targetBrand, developerVolume]);

  const handleUseConverted = useCallback(() => {
    if (result && onUseConvertedFormula) {
      onUseConvertedFormula(result);
    }
  }, [result, onUseConvertedFormula]);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    padding: 24,
    background: 'rgba(30, 30, 45, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
  };

  const headerStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 600,
    color: '#F5F5F7',
    margin: 0,
  };

  const subHeaderStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#71717A',
    margin: '4px 0 0 0',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  };

  const selectStyle: React.CSSProperties = {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(20, 20, 30, 0.8)',
    color: '#F5F5F7',
    fontSize: 14,
    minWidth: 200,
    cursor: 'pointer',
    outline: 'none',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    background: '#9333EA',
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    transition: 'opacity 0.2s',
  };

  const hardStopBoxStyle: React.CSSProperties = {
    padding: 16,
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };

  const warningBoxStyle: React.CSSProperties = {
    padding: 16,
    background: 'rgba(234, 179, 8, 0.08)',
    border: '1px solid rgba(234, 179, 8, 0.25)',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };

  const shadeCardStyle: React.CSSProperties = {
    padding: 16,
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  };

  const shadeRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  };

  const badgeStyle = (color: string): React.CSSProperties => ({
    padding: '4px 10px',
    borderRadius: 6,
    background: `${color}20`,
    color,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  });

  const colorDotStyle = (hex: string): React.CSSProperties => ({
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: hex,
    border: '2px solid rgba(255, 255, 255, 0.15)',
    flexShrink: 0,
  });

  const useButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    borderRadius: 8,
    border: 'none',
    background: '#22C55E',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  };

  return (
    <div style={containerStyle}>
      <p style={headerStyle}>🔄 Brand Conversion</p>
      <p style={subHeaderStyle}>
        Convert this formula to a different brand's equivalent shades.
      </p>

      {/* Target brand selector */}
      <div style={rowStyle}>
        <select
          style={selectStyle}
          value={targetBrand}
          onChange={(e) => setTargetBrand(e.target.value)}
          disabled={brandsLoading}
        >
          <option value="" disabled>
            {brandsLoading ? 'Loading brands...' : 'Select target brand...'}
          </option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>

        <button
          style={buttonStyle}
          onClick={handleConvert}
          disabled={!targetBrand || loading}
        >
          {loading ? 'Converting...' : 'Convert Formula'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={hardStopBoxStyle}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>
            ⚠️ Conversion Error
          </span>
          <span style={{ fontSize: 12, color: '#F5F5F7' }}>{error}</span>
        </div>
      )}

      {/* Hard Stops */}
      {result && result.hardStops.length > 0 && (
        <div style={hardStopBoxStyle}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>
            🚫 Hard Stops
          </span>
          {result.hardStops.map((stop, i) => (
            <span key={i} style={{ fontSize: 12, color: '#F5F5F7', lineHeight: 1.5 }}>
              • {stop}
            </span>
          ))}
          <span style={{ fontSize: 11, color: '#A1A1AA', marginTop: 4 }}>
            These shades could not be matched. Recommend custom formulation.
          </span>
        </div>
      )}

      {/* Warnings */}
      {result && result.warnings.length > 0 && (
        <div style={warningBoxStyle}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#EAB308' }}>
            ⚡ Warnings
          </span>
          {result.warnings.map((warn, i) => (
            <span key={i} style={{ fontSize: 12, color: '#F5F5F7', lineHeight: 1.5 }}>
              • {warn}
            </span>
          ))}
        </div>
      )}

      {/* Converted Shades */}
      {result && result.shades.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.shades.map((shade, i) => (
              <div key={i} style={shadeCardStyle}>
                <div style={shadeRowStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={colorDotStyle(shade.convertedHex)} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F7' }}>
                        {shade.convertedCode}
                      </span>
                      <span style={{ fontSize: 12, color: '#A1A1AA' }}>
                        {shade.convertedName}
                      </span>
                      <span style={{ fontSize: 11, color: '#71717A' }}>
                        {BRAND_DISPLAY_NAMES[shade.convertedBrand] || shade.convertedBrand}
                        {' · '}
                        {shade.convertedLine}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: '#F5F5F7', fontWeight: 500 }}>
                      {shade.grams}g
                    </span>
                    <span style={badgeStyle(CONFIDENCE_COLORS[shade.matchType])}>
                      {CONFIDENCE_LABELS[shade.matchType]}
                    </span>
                  </div>
                </div>

                {shade.notes && (
                  <span style={{ fontSize: 11, color: '#71717A', lineHeight: 1.4 }}>
                    {shade.notes}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Developer conversion */}
          <div style={shadeCardStyle}>
            <div style={shadeRowStyle}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>
                Developer
              </span>
              <span style={{ fontSize: 13, color: '#A1A1AA' }}>
                {result.developer.originalVolume}vol → {' '}
                <strong style={{ color: '#F5F5F7' }}>{result.developer.convertedVolume}vol</strong>
              </span>
            </div>
            <div style={shadeRowStyle}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>
                Mixing Ratio
              </span>
              <span style={{ fontSize: 13, color: '#A1A1AA' }}>
                {result.developer.mixingRatio}
              </span>
            </div>
            {result.developer.notes && (
              <span style={{ fontSize: 11, color: '#71717A', lineHeight: 1.4 }}>
                {result.developer.notes}
              </span>
            )}
          </div>

          {/* Overall confidence */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#A1A1AA' }}>Overall Confidence:</span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color:
                  result.overallConfidence >= 0.85
                    ? '#22C55E'
                    : result.overallConfidence >= 0.7
                      ? '#EAB308'
                      : result.overallConfidence >= 0.5
                        ? '#F97316'
                        : '#EF4444',
              }}
            >
              {Math.round(result.overallConfidence * 100)}%
            </span>
          </div>

          {/* Use converted formula button */}
          {onUseConvertedFormula && result.hardStops.length === 0 && (
            <button style={useButtonStyle} onClick={handleUseConverted}>
              ✅ Use Converted Formula
            </button>
          )}
        </>
      )}
    </div>
  );
}
