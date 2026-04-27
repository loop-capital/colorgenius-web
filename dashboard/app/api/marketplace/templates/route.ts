/**
 * POST /api/marketplace/templates
 * List a template for sale
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow, listTemplateSchema } from '@/lib/api/validation';
import { communityPosts, templates, generateId } from '@/lib/api/mock-data';
import { Template, ApiResponse } from '@/lib/api/types';

function getUserFromAuth(request: NextRequest): { id: string; name: string } | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const [id, name] = token.split(':');
  if (!id || !name) return null;
  return { id, name };
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromAuth(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Bearer token required' },
      }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const data = validateOrThrow(listTemplateSchema, body);

    // Verify community post exists
    const post = communityPosts.find(p => p.id === data.community_post_id);
    if (!post) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: { code: 'POST_NOT_FOUND', message: 'Community post not found' },
      }, { status: 404 });
    }

    const template: Template = {
      id: generateId(),
      creator_id: user.id,
      creator_name: user.name,
      community_post_id: data.community_post_id,
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags || [],
      price_cents: data.price_cents,
      rating: 0,
      review_count: 0,
      purchase_count: 0,
      adaptation_params: data.adaptation_params || {},
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    templates.push(template);

    return NextResponse.json<ApiResponse<Template>>({
      success: true,
      data: template,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list template';
    return NextResponse.json<ApiResponse>({
      success: false,
      error: { code: 'LIST_TEMPLATE_FAILED', message },
    }, { status: 500 });
  }
}
