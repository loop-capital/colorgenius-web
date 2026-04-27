const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Create two brands
  const redken = await prisma.brand.create({
    data: {
      name: 'Redken',
      slug: 'redken',
      manufacturer: "L'Oréal Professional",
      origin_country: 'US',
      tier: 'premium',
      is_active: true,
    },
  })

  const wella = await prisma.brand.create({
    data: {
      name: 'Wella',
      slug: 'wella',
      manufacturer: 'Wella Company',
      origin_country: 'DE',
      tier: 'premium',
      is_active: true,
    },
  })

  // Create product lines for Redken
  await prisma.productLine.createMany({
    data: [
      {
        brand_id: redken.id,
        name: 'Color Gels Lacquers',
        code: 'CGL',
        slug: 'color-gels-lacquers',
        color_type: 'permanent',
        ammonia_free: false,
        plex_technology: null,
        alkaline_agent: null,
        max_gray_coverage: 100,
        max_lift_levels: 4,
        mixing_ratio: '1:1',
        developer_options: [10, 20, 30, 40],
        base_processing_time: 30,
        max_processing_time: 45,
        can_use_heat: true,
        is_active: true,
      },
      {
        brand_id: redken.id,
        name: 'Shades EQ',
        code: 'SEQ',
        slug: 'shades-eq',
        color_type: 'demi-permanent',
        ammonia_free: true,
        plex_technology: null,
        alkaline_agent: null,
        max_gray_coverage: 0,
        max_lift_levels: 0,
        mixing_ratio: '1:1',
        developer_options: [0, 10, 20],
        base_processing_time: 20,
        max_processing_time: 20,
        can_use_heat: false,
        is_active: true,
      },
    ]
  })

  // Create product lines for Wella
  await prisma.productLine.createMany({
    data: [
      {
        brand_id: wella.id,
        name: 'Koleston Perfect ME',
        code: 'KPM',
        slug: 'koleston-perfect-me',
        color_type: 'permanent',
        ammonia_free: false,
        plex_technology: 'ME',
        alkaline_agent: null,
        max_gray_coverage: 100,
        max_lift_levels: 4,
        mixing_ratio: '1:1',
        developer_options: [10, 20, 30, 40],
        base_processing_time: 30,
        max_processing_time: 45,
        can_use_heat: true,
        is_active: true,
      },
      {
        brand_id: wella.id,
        name: 'Color Fresh Create',
        code: 'CFC',
        slug: 'color-fresh-create',
        color_type: 'semi-permanent',
        ammonia_free: true,
        plex_technology: null,
        alkaline_agent: null,
        max_gray_coverage: 0,
        max_lift_levels: 0,
        mixing_ratio: '1:2',
        developer_options: [0, 10, 20],
        base_processing_time: 20,
        max_processing_time: 20,
        can_use_heat: false,
        is_active: true,
      },
    ]
  })

  console.log('Seed data inserted for brands and product lines')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
