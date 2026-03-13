/**
 * POST /api/signups
 *
 * Public endpoint for readee-site questionnaire submissions.
 * No authentication required. CORS enabled for cross-origin requests.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const DEFAULT_ALLOWED_ORIGINS = [
  'https://learn.readee.app',
  'https://readee.app',
  'https://www.readee.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const SIGNUP_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const EMAIL_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_PER_IP_PER_HOUR = 5;
const MAX_PER_EMAIL_PER_DAY = 3;

const BASE_CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const signupSchema = z.object({
  role: z.enum(['parent', 'teacher']),
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().min(1).max(80),
  email: z.email().max(254).transform((v) => v.trim().toLowerCase()),
  school_name: z.string().trim().max(160).optional().nullable(),
  grades: z.array(z.string().trim().max(30)).max(8).optional().nullable(),
  class_size: z.union([z.number().int().min(1).max(500), z.string().trim().max(30)]).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  children: z.array(z.object({
    name: z.string().trim().min(1).max(80).optional(),
    grade: z.string().trim().max(30).optional().nullable(),
  })).max(5).optional().nullable(),
  captcha_token: z.string().trim().max(4096).optional(),
  website: z.string().optional(), // honeypot
});

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

function getAllowedOrigins(): string[] {
  const raw = process.env.SIGNUPS_ALLOWED_ORIGINS;
  if (!raw) return DEFAULT_ALLOWED_ORIGINS;
  return raw.split(',').map((v) => v.trim()).filter(Boolean);
}

function getOrigin(request: NextRequest): string {
  const origin = request.headers.get('origin');
  return origin && origin !== 'null' ? origin : '';
}

function buildCorsHeaders(origin: string) {
  const allowed = getAllowedOrigins();
  const isAllowed = origin && allowed.includes(origin);
  return {
    ...BASE_CORS_HEADERS,
    'Vary': 'Origin',
    ...(isAllowed ? { 'Access-Control-Allow-Origin': origin } : {}),
  };
}

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip')?.trim() || '';
}

async function verifyTurnstileToken(token: string | undefined, remoteIp: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // If Turnstile is not configured, do not block non-production environments.
  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }
  if (!token) return false;

  const payload = new URLSearchParams();
  payload.append('secret', secret);
  payload.append('response', token);
  if (remoteIp) payload.append('remoteip', remoteIp);

  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: payload,
  });

  if (!verifyRes.ok) return false;
  const data = (await verifyRes.json()) as TurnstileResponse;
  return Boolean(data.success);
}

export async function OPTIONS(request: NextRequest) {
  const origin = getOrigin(request);
  return new NextResponse(null, { status: 204, headers: buildCorsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  try {
    const origin = getOrigin(request);
    const corsHeaders = buildCorsHeaders(origin);
    if (!corsHeaders['Access-Control-Allow-Origin']) {
      return NextResponse.json(
        { success: false, error: 'Origin not allowed' },
        { status: 403, headers: corsHeaders }
      );
    }

    const parsed = signupSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid signup payload' },
        { status: 400, headers: corsHeaders }
      );
    }
    const body = parsed.data;
    const { role, first_name, last_name, email } = body;

    // Honeypot for basic bot traffic
    if (body.website && body.website.trim().length > 0) {
      return NextResponse.json({ success: true }, { status: 202, headers: corsHeaders });
    }

    const sourceIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || null;
    const captchaOk = await verifyTurnstileToken(body.captcha_token, sourceIp);
    if (!captchaOk) {
      return NextResponse.json(
        { success: false, error: 'Captcha verification failed.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const admin = supabaseAdmin();
    const ipSince = new Date(Date.now() - SIGNUP_WINDOW_MS).toISOString();
    const emailSince = new Date(Date.now() - EMAIL_WINDOW_MS).toISOString();

    if (sourceIp) {
      const { count: recentByIp, error: ipLimitError } = await admin
        .from('signups')
        .select('id', { count: 'exact', head: true })
        .eq('source_ip', sourceIp)
        .gte('created_at', ipSince);

      if (ipLimitError) {
        console.error('Error checking IP rate limit:', ipLimitError);
      } else if ((recentByIp ?? 0) >= MAX_PER_IP_PER_HOUR) {
        return NextResponse.json(
          { success: false, error: 'Too many requests. Please try again later.' },
          { status: 429, headers: corsHeaders }
        );
      }
    }

    const { count: recentByEmail, error: emailLimitError } = await admin
      .from('signups')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', emailSince);

    if (emailLimitError) {
      console.error('Error checking email rate limit:', emailLimitError);
    } else if ((recentByEmail ?? 0) >= MAX_PER_EMAIL_PER_DAY) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions for this email. Please try again tomorrow.' },
        { status: 429, headers: corsHeaders }
      );
    }

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
        source_ip: sourceIp || null,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting signup:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save signup' },
        { status: 500, headers: corsHeaders }
      );
    }

    // For parents, auto-create a Supabase auth account + profile
    let existingAccount = false;
    let passwordResetLink: string | null = null;
    if (role === 'parent') {
      try {
        const { data: authUser, error: authError } = await admin.auth.admin.createUser({
          email,
          email_confirm: false,
          user_metadata: { first_name, last_name, role: 'parent' },
        });

        let userId: string | null = null;

        if (authError) {
          if (authError.message?.includes('already been registered')) {
            existingAccount = true;
            console.log('Auth account already exists for:', email);

            // Look up existing user to get their ID for children insert
            const { data: userList } = await admin.auth.admin.listUsers();
            const existingUser = userList?.users?.find((u) => u.email === email);
            if (existingUser) {
              userId = existingUser.id;
              console.log('Found existing user ID:', userId);
            }
          } else {
            console.error('Error creating auth user:', authError);
          }
        } else if (authUser?.user) {
          userId = authUser.user.id;
          console.log('Auth user created:', userId);

          // Create a profile row linked to the new auth user
          const { error: profileError } = await admin
            .from('profiles')
            .insert({
              id: userId,
              display_name: `${first_name} ${last_name}`,
              role: 'parent',
              onboarding_complete: false,
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          } else {
            console.log('Profile created for user:', userId);
          }
        }

        // Insert children — runs for both new and existing accounts
        if (userId && body.children?.length) {
          console.log('Inserting children for user:', userId, 'children data:', JSON.stringify(body.children));
          try {
            const childrenRows = (body.children as { name?: string; grade?: string }[]).map((c) => ({
              parent_id: userId as string,
              first_name: c.name || 'Child',
              grade: c.grade || null,
            }));
            console.log('Children rows to insert:', JSON.stringify(childrenRows));

            const { data: insertedChildren, error: childrenError } = await admin
              .from('children')
              .insert(childrenRows)
              .select();

            if (childrenError) {
              console.error('Error inserting children:', JSON.stringify(childrenError));
            } else {
              console.log(`Inserted ${insertedChildren?.length} children for user:`, userId);
            }
          } catch (childErr) {
            console.error('Error in children insertion:', childErr);
          }
        } else {
          console.log('Skipping children insert — userId:', userId, 'children count:', body.children?.length ?? 0);
        }

        // Generate a password-reset link so the parent can set their password & log in
        if (!existingAccount) {
          const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
            type: 'recovery',
            email,
            options: {
              redirectTo: 'https://learn.readee.app/signup',
            },
          });
          if (linkError) {
            console.error('Error generating password reset link:', linkError);
          } else if (linkData?.properties?.action_link) {
            passwordResetLink = linkData.properties.action_link;
            console.log('Password reset link generated for:', email);
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
          <a href="${passwordResetLink || 'https://learn.readee.app/signup'}" style="display:inline-block;background:linear-gradient(135deg,#4338ca,#6366f1);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:16px;font-weight:700;box-shadow:0 4px 16px rgba(99,102,241,0.3);">
            ${passwordResetLink ? 'Set Your Password & Get Started \u2192' : 'Go to My Dashboard \u2192'}
          </a>
        </div>
      </div>
      <div style="padding:24px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
          You're receiving this because you signed up at Readee.<br>
          Start your free trial today \u00b7 Built by educators \u00b7 Science of Reading
        </p>
      </div>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:12px;color:#9ca3af;">\u00a9 2026 Readee \u00b7 Helping every child become a confident reader</p>
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
          <a href="https://learn.readee.app" style="display:inline-block;background:linear-gradient(135deg,#4338ca,#6366f1);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:16px;font-weight:700;box-shadow:0 4px 16px rgba(99,102,241,0.3);">
            Learn More About Readee \u2192
          </a>
        </div>
      </div>
      <div style="padding:24px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
          You're receiving this because you submitted a classroom request at Readee.<br>
          Built by educators \u00b7 Science of Reading \u00b7 Try it free
        </p>
      </div>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:12px;color:#9ca3af;">\u00a9 2026 Readee \u00b7 Helping every child become a confident reader</p>
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
        getResend().emails.send({
          from: 'hello@readee.app',
          to: email,
          subject: welcomeSubject,
          html: welcomeHtml,
        }),
        getResend().emails.send({
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
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error processing signup:', error);
    const origin = getOrigin(request);
    const corsHeaders = buildCorsHeaders(origin);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
