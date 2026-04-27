import { successResponse } from '@/lib/api/response'

export async function GET() {
  const colors = [
    { name: 'Golden Blonde', hex: '#D4AA7D', count: 1247 },
    { name: 'Ash Brown', hex: '#8B7355', count: 982 },
    { name: 'Rose Gold', hex: '#C4956A', count: 876 },
    { name: 'Platinum', hex: '#E8E0D5', count: 743 },
    { name: 'Caramel Balayage', hex: '#B8956A', count: 621 },
    { name: 'Chocolate Brown', hex: '#5C3A21', count: 598 },
    { name: 'Copper Red', hex: '#B8623A', count: 445 },
    { name: 'Smoky Silver', hex: '#9E9E9E', count: 312 },
  ]
  return successResponse(colors)
}
