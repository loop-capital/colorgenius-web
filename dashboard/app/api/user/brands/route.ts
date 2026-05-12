import { NextResponse } from 'next/server';

// Returns the current user's preferred brands
// Falls back to all brands if no preferences are set
export async function GET() {
  try {
    // TODO: Get from authenticated user's profile when auth is restored
    // For now, check if preferences were stored during onboarding
    // The questionnaire stores brandPreference which can be used as a seed
    
    // Return all available brands as fallback
    // In production, this would filter by the user's preferred_brands array
    const allBrands = [
      'Davines', 'Wella', 'Schwarzkopf', 'Redken', 'Matrix',
      'Joico', 'Paul Mitchell', 'Pulp Riot', 'Goldwell',
      'L\'Oréal', 'Pravana', 'Kenra'
    ];

    return NextResponse.json({
      brands: allBrands,
      source: 'all', // 'user' when auth is wired up, 'all' for now
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}
