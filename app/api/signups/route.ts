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

    // Send emails (await so Vercel doesn't kill the function early)
    const roleLabel = role === 'parent' ? 'Parent' : 'Teacher';
    const fullName = `${first_name} ${last_name}`;

    try {
      console.log('RESEND_API_KEY present:', !!process.env.RESEND_API_KEY);

      // Build welcome email for the person who signed up
      let welcomeSubject: string;
      let welcomeHtml: string;

      if (role === 'parent') {
        const childrenNames = (body.children as { name?: string }[] | undefined)
          ?.map((c) => c.name)
          .filter(Boolean);
        const childrenLine = childrenNames?.length
          ? `<p style="margin:8px 0">We're excited to help <strong>${childrenNames.join(', ')}</strong> build their reading skills!</p>`
          : '';

        welcomeSubject = 'Welcome to Readee! \u{1F389}';
        welcomeHtml = `
          <div style="font-family:sans-serif;max-width:500px">
            <h2 style="margin:0 0 16px">Welcome to Readee, ${first_name}!</h2>
            <p style="margin:8px 0">Thank you for signing up. We're so glad you're here.</p>
            ${childrenLine}
            <p style="margin:8px 0">You can log in at any time to start reading practice and track progress.</p>
            <p style="margin:24px 0 0;color:#666">The Readee Team</p>
          </div>`;
      } else {
        const detailsList = [
          body.school_name ? `<li><strong>School:</strong> ${body.school_name}</li>` : '',
          body.grades?.length ? `<li><strong>Grades:</strong> ${body.grades.join(', ')}</li>` : '',
          body.class_size ? `<li><strong>Class Size:</strong> ${body.class_size}</li>` : '',
        ].filter(Boolean).join('');

        welcomeSubject = 'We received your request!';
        welcomeHtml = `
          <div style="font-family:sans-serif;max-width:500px">
            <h2 style="margin:0 0 16px">Thanks for your interest, ${first_name}!</h2>
            <p style="margin:8px 0">We've received your request to bring Readee to your classroom.</p>
            ${detailsList ? `<p style="margin:8px 0"><strong>Your details:</strong></p><ul style="margin:4px 0;padding-left:20px">${detailsList}</ul>` : ''}
            <p style="margin:8px 0">A member of our team will reach out within <strong>1-2 business days</strong> to get you set up.</p>
            <p style="margin:24px 0 0;color:#666">The Readee Team</p>
          </div>`;
      }

      // Build internal notification for Filip
      let notifDetailsHtml = '';
      if (role === 'parent' && body.children?.length) {
        const childrenRows = (body.children as { name?: string; grade?: string }[])
          .map((c) =>
            `<tr><td style="padding:4px 12px 4px 0">${c.name || '\u2014'}</td><td style="padding:4px 0">${c.grade || '\u2014'}</td></tr>`
          )
          .join('');
        notifDetailsHtml = `
          <h3 style="margin:16px 0 8px">Children</h3>
          <table style="border-collapse:collapse">
            <tr><th style="text-align:left;padding:4px 12px 4px 0">Name</th><th style="text-align:left;padding:4px 0">Grade</th></tr>
            ${childrenRows}
          </table>`;
      } else if (role === 'teacher') {
        notifDetailsHtml = `
          <h3 style="margin:16px 0 8px">School Details</h3>
          <ul style="margin:0;padding-left:20px">
            ${body.school_name ? `<li><strong>School:</strong> ${body.school_name}</li>` : ''}
            ${body.grades?.length ? `<li><strong>Grades:</strong> ${body.grades.join(', ')}</li>` : ''}
            ${body.class_size ? `<li><strong>Class Size:</strong> ${body.class_size}</li>` : ''}
          </ul>`;
      }

      // Send both emails in parallel
      const [welcomeResult, notifResult] = await Promise.all([
        resend.emails.send({
          from: 'onboarding@resend.dev',
          to: email,
          subject: welcomeSubject,
          html: welcomeHtml,
        }),
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
              ${notifDetailsHtml}
              ${body.notes ? `<p style="margin:16px 0 4px"><strong>Notes:</strong> ${body.notes}</p>` : ''}
            </div>`,
        }),
      ]);

      if (welcomeResult.error) console.error('Welcome email error:', welcomeResult.error);
      else console.log('Welcome email sent:', welcomeResult.data);

      if (notifResult.error) console.error('Notification email error:', notifResult.error);
      else console.log('Notification email sent:', notifResult.data);
    } catch (emailErr) {
      console.error('Failed to send signup emails:', emailErr);
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
