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

    // For parents, auto-create a Supabase auth account + profile
    let existingAccount = false;
    if (role === 'parent') {
      try {
        const { data: authUser, error: authError } = await admin.auth.admin.createUser({
          email,
          email_confirm: false,
          user_metadata: { first_name, last_name, role: 'parent' },
        });

        if (authError) {
          if (authError.message?.includes('already been registered')) {
            existingAccount = true;
            console.log('Auth account already exists for:', email);
          } else {
            console.error('Error creating auth user:', authError);
          }
        } else if (authUser?.user) {
          console.log('Auth user created:', authUser.user.id);

          // Create a profile row linked to the new auth user
          const { error: profileError } = await admin
            .from('profiles')
            .insert({
              id: authUser.user.id,
              display_name: `${first_name} ${last_name}`,
              role: 'parent',
              onboarding_complete: false,
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          } else {
            console.log('Profile created for user:', authUser.user.id);
          }
        }

        // Send magic link so the parent can confirm & log in
        if (!existingAccount) {
          const { error: magicLinkError } = await admin.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: {
              redirectTo: 'https://readee-app2-0.vercel.app/signup',
            },
          });
          if (magicLinkError) {
            console.error('Error generating magic link:', magicLinkError);
          }
        }
      } catch (accountErr) {
        console.error('Error in account creation flow:', accountErr);
      }
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
        const childrenBlock = childrenNames?.length
          ? `<div style="background:#eef2ff;border-radius:12px;padding:20px 24px;margin:20px 0;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:0.5px;">Signed up for</p>
              <p style="margin:0;font-size:16px;font-weight:600;color:#1e1b4b;">${childrenNames.join(', ')}</p>
            </div>`
          : '';

        welcomeSubject = 'Welcome to Readee! \u{1F389}';
        welcomeHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,27,75,0.08);">
      <div style="background:linear-gradient(135deg,#4338ca,#8b5cf6);padding:40px 32px;text-align:center;">
        <div style="font-size:28px;font-weight:800;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;letter-spacing:-0.5px;">READ<span style="color:#c7d2fe;">EE</span></div>
        <div style="margin-top:16px;font-size:40px;">\u{1F389}</div>
        <h1 style="margin:12px 0 0;font-size:24px;font-weight:700;color:#ffffff;">Welcome aboard, ${first_name}!</h1>
      </div>
      <div style="padding:32px;">
        <p style="font-size:16px;line-height:1.7;color:#374151;margin:0 0 20px;">
          You've taken a great first step for your child's reading journey. Readee uses the <strong>Science of Reading</strong> \u2014 the same evidence-based methods trusted by educators \u2014 to help kids build real confidence with reading.
        </p>
        ${childrenBlock}
        <div style="margin:28px 0;">
          <h2 style="font-size:16px;font-weight:700;color:#1e1b4b;margin:0 0 16px;">Here's what happens next:</h2>
          <table style="width:100%;border-spacing:0;">
            <tr>
              <td style="padding:8px 12px 8px 0;vertical-align:top;width:32px;">
                <div style="width:28px;height:28px;border-radius:50%;background:#e0e7ff;color:#4338ca;font-size:13px;font-weight:700;text-align:center;line-height:28px;">1</div>
              </td>
              <td style="padding:8px 0;font-size:14px;line-height:1.6;color:#4b5563;">
                <strong style="color:#1e1b4b;">Log in to your dashboard</strong><br>Set up reading profiles for your children
              </td>
            </tr>
            <tr>
              <td style="padding:8px 12px 8px 0;vertical-align:top;">
                <div style="width:28px;height:28px;border-radius:50%;background:#e0e7ff;color:#4338ca;font-size:13px;font-weight:700;text-align:center;line-height:28px;">2</div>
              </td>
              <td style="padding:8px 0;font-size:14px;line-height:1.6;color:#4b5563;">
                <strong style="color:#1e1b4b;">Start a 10-minute lesson</strong><br>Phonics, vocabulary, and comprehension \u2014 all in one session
              </td>
            </tr>
            <tr>
              <td style="padding:8px 12px 8px 0;vertical-align:top;">
                <div style="width:28px;height:28px;border-radius:50%;background:#e0e7ff;color:#4338ca;font-size:13px;font-weight:700;text-align:center;line-height:28px;">3</div>
              </td>
              <td style="padding:8px 0;font-size:14px;line-height:1.6;color:#4b5563;">
                <strong style="color:#1e1b4b;">Watch them grow</strong><br>Track progress and celebrate milestones together
              </td>
            </tr>
          </table>
        </div>
        <div style="text-align:center;margin:32px 0 8px;">
          <a href="https://readee-app2-0.vercel.app/signup" style="display:inline-block;background:linear-gradient(135deg,#4338ca,#6366f1);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:16px;font-weight:700;box-shadow:0 4px 16px rgba(99,102,241,0.3);">
            Go to My Dashboard \u2192
          </a>
        </div>
      </div>
      <div style="padding:24px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
          You're receiving this because you signed up at Readee.<br>
          100% free \u00b7 Built by educators \u00b7 No credit card ever
        </p>
      </div>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:12px;color:#9ca3af;">\u00a9 2025 Readee \u00b7 Helping every child become a confident reader</p>
    </div>
  </div>
</body>
</html>`;
      } else {
        const schoolRow = body.school_name
          ? `<tr><td style="padding:6px 0;font-size:14px;color:#9ca3af;width:100px;">School</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e1b4b;">${body.school_name}</td></tr>`
          : '';
        const gradesRow = body.grades?.length
          ? `<tr><td style="padding:6px 0;font-size:14px;color:#9ca3af;width:100px;">Grades</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e1b4b;">${body.grades.join(', ')}</td></tr>`
          : '';
        const classSizeRow = body.class_size
          ? `<tr><td style="padding:6px 0;font-size:14px;color:#9ca3af;width:100px;">Class Size</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#1e1b4b;">${body.class_size} students</td></tr>`
          : '';

        welcomeSubject = 'We received your request!';
        welcomeHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,27,75,0.08);">
      <div style="background:linear-gradient(135deg,#4338ca,#8b5cf6);padding:40px 32px;text-align:center;">
        <div style="font-size:28px;font-weight:800;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;letter-spacing:-0.5px;">READ<span style="color:#c7d2fe;">EE</span></div>
        <div style="margin-top:16px;font-size:40px;">\u{1F4EC}</div>
        <h1 style="margin:12px 0 0;font-size:24px;font-weight:700;color:#ffffff;">We got your request, ${first_name}!</h1>
      </div>
      <div style="padding:32px;">
        <p style="font-size:16px;line-height:1.7;color:#374151;margin:0 0 24px;">
          Thanks for your interest in bringing Readee to your classroom. We're excited to help your students build confidence with reading using the <strong>Science of Reading</strong>.
        </p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin:0 0 24px;">
          <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:0.5px;">Your Request Details</p>
          <table style="width:100%;border-spacing:0;">
            ${schoolRow}
            ${gradesRow}
            ${classSizeRow}
          </table>
        </div>
        <div style="background:#eef2ff;border-radius:12px;padding:24px;margin:0 0 24px;">
          <div style="text-align:center;">
            <div style="font-size:24px;margin-bottom:8px;">\u{1F91D}</div>
            <h2 style="font-size:16px;font-weight:700;color:#1e1b4b;margin:0 0 8px;">What happens next?</h2>
            <p style="font-size:14px;line-height:1.7;color:#4b5563;margin:0;">
              A Readee team member will reach out to you within <strong style="color:#1e1b4b;">1\u20132 business days</strong> to help you get set up. We'll walk you through everything \u2014 from creating student accounts to integrating Readee into your daily routine.
            </p>
          </div>
        </div>
        <p style="font-size:14px;line-height:1.7;color:#6b7280;margin:0;text-align:center;font-style:italic;">
          In the meantime, feel free to explore our site to learn more about how Readee works.
        </p>
        <div style="text-align:center;margin:28px 0 8px;">
          <a href="https://readee-site.vercel.app" style="display:inline-block;background:linear-gradient(135deg,#4338ca,#6366f1);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:16px;font-weight:700;box-shadow:0 4px 16px rgba(99,102,241,0.3);">
            Learn More About Readee \u2192
          </a>
        </div>
      </div>
      <div style="padding:24px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
          You're receiving this because you submitted a classroom request at Readee.<br>
          100% free \u00b7 Built by educators \u00b7 Science of Reading
        </p>
      </div>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:12px;color:#9ca3af;">\u00a9 2025 Readee \u00b7 Helping every child become a confident reader</p>
    </div>
  </div>
</body>
</html>`;
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
          from: 'hello@readee.app',
          to: email,
          subject: welcomeSubject,
          html: welcomeHtml,
        }),
        resend.emails.send({
          from: 'hello@readee.app',
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
      {
        success: true,
        signup: data,
        ...(existingAccount && { message: 'An account with this email already exists. You can log in with your existing account.' }),
      },
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
