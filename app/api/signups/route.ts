/**
 * POST /api/signups
 *
 * Public endpoint for readee-site questionnaire submissions.
 * No authentication required. CORS enabled for cross-origin requests.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { role, first_name, last_name, email } = body;

    if (!role || !first_name || !last_name || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: role, first_name, last_name, email' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!['parent', 'teacher'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be parent or teacher' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const admin = supabaseAdmin();

    const { data, error } = await admin
      .from('signups')
      .insert({
        role,
        first_name,
        last_name,
        email,
        school_name: body.school_name ?? null,
        grades: body.grades ?? null,
        class_size: body.class_size ?? null,
        notes: body.notes ?? null,
        children: body.children ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting signup:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save signup' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, signup: data },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error('Error processing signup:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
