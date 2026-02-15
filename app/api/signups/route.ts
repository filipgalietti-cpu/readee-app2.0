/**
 * POST /api/signups
 *
 * Public endpoint for readee-site questionnaire submissions.
 * No authentication required. CORS enabled for cross-origin requests.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send notification email (don't block the response on failure)
    const roleLabel = role === 'parent' ? 'Parent' : 'Teacher';
    const fullName = `${first_name} ${last_name}`;

    let detailsHtml = '';
    if (role === 'parent' && body.children?.length) {
      const childrenRows = body.children
        .map((c: { name?: string; grade?: string }) =>
          `<tr><td style="padding:4px 12px 4px 0">${c.name || '—'}</td><td style="padding:4px 0">${c.grade || '—'}</td></tr>`
        )
        .join('');
      detailsHtml = `
        <h3 style="margin:16px 0 8px">Children</h3>
        <table style="border-collapse:collapse">
          <tr><th style="text-align:left;padding:4px 12px 4px 0">Name</th><th style="text-align:left;padding:4px 0">Grade</th></tr>
          ${childrenRows}
        </table>`;
    } else if (role === 'teacher') {
      detailsHtml = `
        <h3 style="margin:16px 0 8px">School Details</h3>
        <ul style="margin:0;padding-left:20px">
          ${body.school_name ? `<li><strong>School:</strong> ${body.school_name}</li>` : ''}
          ${body.grades?.length ? `<li><strong>Grades:</strong> ${body.grades.join(', ')}</li>` : ''}
          ${body.class_size ? `<li><strong>Class Size:</strong> ${body.class_size}</li>` : ''}
        </ul>`;
    }

    resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'filip.galietti@gmail.com',
      subject: `New Readee Signup: ${roleLabel} - ${fullName}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px">
          <h2 style="margin:0 0 16px">New ${roleLabel} Signup</h2>
          <p style="margin:4px 0"><strong>Name:</strong> ${fullName}</p>
          <p style="margin:4px 0"><strong>Email:</strong> ${email}</p>
          <p style="margin:4px 0"><strong>Role:</strong> ${roleLabel}</p>
          ${detailsHtml}
          ${body.notes ? `<p style="margin:16px 0 4px"><strong>Notes:</strong> ${body.notes}</p>` : ''}
        </div>`,
    }).catch((err) => console.error('Failed to send signup notification email:', err));

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
