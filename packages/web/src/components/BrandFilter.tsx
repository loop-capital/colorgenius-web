'use client';

import { Check } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  logo_url?: string;
}

interface BrandFilterProps {
  brands: Brand[];
  selected: string;
  onChange: (brandId: string) => void;
}

const BRAND_LOGOS: Record<string, string> = {
  redken: 'R',
  wella: 'W',
  schwarzkopf: 'S',
  matrix: 'M',
};

const BRAND_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  redken: { bg: 'bg-red-600', text: 'text-white', ring: 'ring-red-600' },
  wella: { bg: 'bg-orange-500', text: 'text-white', ring: 'ring-orange-500' },
  schwarzkopf: { bg: 'bg-blue-700', text: 'text-white', ring: 'ring-blue-700' },
  matrix: { bg: 'bg-pink-600', text: 'text-white', ring: 'ring-pink-600' },
};

export default function BrandFilter({ brands, selected, onChange }: BrandFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {brands.map((brand) => {
        const isSelected = selected === brand.id;
        const brandKey = brand.id.toLowerCase();
        const colors = BRAND_COLORS[brandKey] || { bg: 'bg-gray-600', text: 'text-white', ring: 'ring-gray-600' };
        const initial = brand.name.charAt(0).toUpperCase();

        return (
          <button
            key={brand.id}
            onClick={() => onChange(brand.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200
              ${isSelected
                ? `${colors.bg} ${colors.text} border-transparent shadow-md`
                : 'bg-white border-cream-300 text-gray-700 hover:border-cream-400'
              }
            `}
          >
            <span
              className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${isSelected ? 'bg-white/20' : colors.bg} ${isSelected ? '' : colors.text}
              `}
            >
              {initial}
            </span>
            <span className="font-medium">{brand.name}</span>
            {isSelected && <Check className="w-4 h-4" />}
          </button>
        );
      })}
    </div>
  );
}