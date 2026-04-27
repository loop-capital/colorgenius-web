import { NextResponse } from 'next/server';
import { ALL_PRODUCTS, BRANDS, LINES_BY_BRAND, HAIR_LEVELS, TONE_DESCRIPTORS, findProductsByLevelAndTone } from '@/lib/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get('brand');
  const line = searchParams.get('line');
  const level = searchParams.get('level');
  const tone = searchParams.get('tone');

  let products = ALL_PRODUCTS;

  if (brand) {
    products = products.filter(p => p.brand === brand);
  }
  if (line) {
    products = products.filter(p => p.line === line);
  }
  if (level) {
    products = products.filter(p => p.level === Number(level));
  }
  if (tone) {
    products = products.filter(p => p.tone === tone || p.secondaryTone === tone);
  }

  return NextResponse.json({
    products,
    meta: {
      total: products.length,
      brands: BRANDS,
      linesByBrand: LINES_BY_BRAND,
      levels: HAIR_LEVELS,
      toneDescriptors: TONE_DESCRIPTORS,
    }
  });
}
