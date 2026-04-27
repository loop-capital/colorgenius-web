import { NextRequest } from 'next/server'
import { successResponse } from '@/lib/api/response'

export async function GET(req: NextRequest) {
  const season = req.nextUrl.searchParams.get('season') || 'summer'

  const collections: Record<string, any[]> = {
    spring: [
      { name: 'Pastel Dreams', hex: '#E8D5C4', description: 'Soft rose gold and champagne tones' },
      { name: 'Honey Balayage', hex: '#C9A96E', description: 'Warm honey with soft highlights' },
      { name: 'Fresh Brunette', hex: '#6B4226', description: 'Rich brown with caramel ribbons' },
    ],
    summer: [
      { name: 'Sun-Kissed Blonde', hex: '#D4AA7D', description: 'Golden blonde with beachy texture' },
      { name: 'Bronze Goddess', hex: '#B8860B', description: 'Deep bronze with golden undertones' },
      { name: 'Coral Pink', hex: '#E9967A', description: 'Vibrant coral with pink highlights' },
    ],
    fall: [
      { name: 'Auburn Spice', hex: '#8B4513', description: 'Rich auburn with copper dimension' },
      { name: 'Chestnut Glow', hex: '#954535', description: 'Warm chestnut with amber lights' },
      { name: 'Burgundy Wine', hex: '#722F37', description: 'Deep burgundy with violet undertones' },
    ],
    winter: [
      { name: 'Icy Platinum', hex: '#E8E0D5', description: 'Cool platinum with silver dimension' },
      { name: 'Midnight Blue', hex: '#2C3E50', description: 'Deep navy with midnight blue undertones' },
      { name: 'Smoky Quartz', hex: '#6B6B6B', description: 'Cool gray with smoky undertones' },
    ],
  }

  return successResponse({
    season,
    title: `${season.charAt(0).toUpperCase() + season.slice(1)} Collection`,
    description: `Trending colors for ${season} 2026`,
    colors: collections[season] || collections.summer,
  })
}
