import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// GET /api/colors — List all color lines from color-lines/ directory
export async function GET(request: NextRequest) {
  try {
    // Try multiple possible paths for color-lines
    const possiblePaths = [
      path.join(process.cwd(), '..', '..', 'color-lines'),
      path.join(process.cwd(), '..', '..', '..', '..', 'color-lines'),
      '/home/jason/.openclaw/workspaces/colorgenius/color-lines',
    ]

    let colorsDir: string | null = null
    for (const p of possiblePaths) {
      try {
        await fs.access(p)
        colorsDir = p
        break
      } catch {
        // try next path
      }
    }

    // Fallback: return mock data if color-lines not found
    if (!colorsDir) {
      return NextResponse.json({
        success: true,
        data: {
          brands: [
            { id: 'wella-koleston', name: 'Wella Koleston Perfect ME', slug: 'wella-koleston', product_lines: ['Koleston Perfect ME', 'Koleston Perfect ME+'], levels_available: [2, 3, 4, 5, 6, 7, 8, 9, 10], color_count: 48 },
            { id: 'redken-color-gels', name: 'Redken Color Gels Lacquers', slug: 'redken-color-gels', product_lines: ['Color Gels Lacquers', 'Shades EQ'], levels_available: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], color_count: 56 },
            { id: 'schwarzkopf-igora', name: 'Schwarzkopf Igora Royal', slug: 'schwarzkopf-igora', product_lines: ['Igora Royal', 'Igora Vibrance'], levels_available: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], color_count: 120 },
            { id: 'davines-todos', name: 'Davines TODOS', slug: 'davines-todos', product_lines: ['TODOS', 'Essential Haircare'], levels_available: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], color_count: 28 },
            { id: 'goldwell-kerasilk', name: 'Goldwell Kerasilk', slug: 'goldwell-kerasilk', product_lines: ['Kerasilk Color', 'Topchic'], levels_available: [2, 3, 4, 5, 6, 7, 8, 9, 10], color_count: 36 },
            { id: 'loreal-inoa', name: "L'Oréal INOA", slug: 'loreal-inoa', product_lines: ['INOA', 'INOA Supreme'], levels_available: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], color_count: 72 },
          ],
          total: 6,
        },
      })
    }

    const files = await fs.readdir(colorsDir)

    const brands = []
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      const content = await fs.readFile(path.join(colorsDir, file), 'utf-8')
      const slug = file.replace('.md', '')

      const titleMatch = content.match(/^#\s+(.+)/m)
      const brandName = titleMatch ? titleMatch[1].trim() : slug

      const productLineMatches = content.match(/^## (.+)/gm)
      const productLines = productLineMatches
        ? productLineMatches.map(m => m.replace(/^## /, '').trim())
        : []

      const levelMatches = content.match(/\b(Level |level |L)(\d+)\b/g) || []
      const levelNums = levelMatches.map(m => {
        const num = m.match(/\d+/)?.[0]
        return num ? parseInt(num) : null
      }).filter((n): n is number => n !== null)
      const levels = Array.from(new Set(levelNums)).sort()

      brands.push({
        id: slug,
        name: brandName,
        slug,
        product_lines: productLines,
        levels_available: levels,
        color_count: (content.match(/\d+\/\d+/g) || []).length,
      })
    }

    return NextResponse.json({ success: true, data: { brands, total: brands.length } })
  } catch (error) {
    console.error('/api/colors error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load color lines' }, { status: 500 })
  }
}