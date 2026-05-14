import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, clientName, clientPhone, clientEmail, salonId, stylistId, formData, result, ingredients, developer, ratio, photoUrl } = body;

    let resolvedClientId = clientId || null;

    // If no existing client but name provided, create one
    if (!resolvedClientId && clientName && clientName.trim()) {
      const nameParts = clientName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const client = await prisma.client.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          email: clientEmail?.trim() || null,
          phone: clientPhone?.trim() || null,
          salon_id: salonId || null,
          primary_stylist_id: stylistId || null,
        },
      });
      resolvedClientId = client.id;
    }

    // Build the formulation record
    const formulation = await prisma.formulations.create({
      data: {
        stylist_id: stylistId || salonId || '',
        client_id: resolvedClientId,
        input_data: formData || {},
        brand: formData?.brandPreference || result?.brand || null,
        product_line: formData?.linePreference || result?.line || null,
        action_type: result?.actionType || null,
        primary_formula: {
          developerVolume: result?.developerVolume,
          processingTime: result?.processingTime,
          steps: result?.steps || [],
          warnings: result?.warnings || [],
          ingredients: ingredients || [],
          developer: developer || null,
          mixingRatio: ratio || null,
        },
        confidence_score: result?.confidence || null,
        cost_estimate: result?.costEstimate || null,
        suggested_price: result?.suggestedPrice || null,
        status: 'generated',
      },
    });

    // Save formula components (the individual shades in the formula)
    if (ingredients && ingredients.length > 0) {
      await prisma.formulation_components.createMany({
        data: ingredients.map((ing: any, idx: number) => ({
          formulation_id: formulation.id,
          component_type: ing.role || 'primary',
          brand: ing.brand || null,
          product_line: ing.series || null,
          shade_code: ing.shadeCode || null,
          amount_oz: ing.targetGrams ? ing.targetGrams / 28.35 : null,
          purpose: ing.role || null,
          sequence_order: idx,
        })),
      });
    }

    // Also save to the simpler `formulas` table for the library view
    if (ingredients && ingredients.length > 0) {
      for (const ing of ingredients) {
        await prisma.formula.create({
          data: {
            stylist_id: stylistId || salonId || null,
            client_id: resolvedClientId,
            name: `${ing.shadeCode || 'Custom'} - ${ing.brand || 'Formula'}`,
            developer_vol: developer?.volume || result?.developerVolume || 20,
            mixing_ratio: ratio || '1:1.5',
            processing_time: result?.processingTime || 30,
            notes: formData ? `Level ${formData.currentLevel} → ${formData.targetLevel}` : null,
            product_brand: ing.brand || null,
            product_line: ing.series || null,
            product_shade: ing.shadeCode || null,
          },
        });
      }
    }

    // Update client visit count
    if (resolvedClientId) {
      await prisma.client.update({
        where: { id: resolvedClientId },
        data: {
          last_visit_at: new Date(),
          total_visits: { increment: 1 },
        },
      });
    }

    return NextResponse.json({
      success: true,
      formulationId: formulation.id,
      clientId: resolvedClientId,
    });
  } catch (error) {
    console.error('POST /api/formulations/save error:', error);
    const message = error instanceof Error ? error.message : 'Failed to save formula';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
