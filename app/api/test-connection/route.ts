import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

interface TestResult {
  name: string
  status: 'passed' | 'failed' | 'warning'
  message: string
  details?: string
  variables?: Record<string, string>
}

interface TestResults {
  timestamp: string
  tests: TestResult[]
  summary: {
    passed: number
    failed: number
    warnings: number
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const serverClient = await createServerClient();
  const { data: { user }, error: authError } = await serverClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: TestResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: { passed: 0, failed: 0, warnings: 0 }
  }

  // Test 1: Regular Client Connection
  try {
    const client = await createServerClient()
    const { data, error } = await client.auth.getSession()
    
    if (error) {
      results.tests.push({
        name: 'Regular Client Connection',
        status: 'warning',
        message: `Auth session check: ${error.message}`,
        details: 'Client created but session check returned an error'
      })
      results.summary.warnings++
    } else {
      results.tests.push({
        name: 'Regular Client Connection',
        status: 'passed',
        message: 'Successfully connected to Supabase',
        details: `Session status: ${data.session ? 'Active session' : 'No active session (expected)'}`
      })
      results.summary.passed++
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    results.tests.push({
      name: 'Regular Client Connection',
      status: 'failed',
      message,
      details: 'Failed to create or test regular client'
    })
    results.summary.failed++
  }

  // Test 2: Admin Client Connection
  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 })
    
    if (error) {
      results.tests.push({
        name: 'Admin Client Connection',
        status: 'warning',
        message: error.message,
        details: error.message.includes('JWT') 
          ? 'Service role key may not be set or invalid'
          : 'Admin client created but API call failed'
      })
      results.summary.warnings++
    } else {
      results.tests.push({
        name: 'Admin Client Connection',
        status: 'passed',
        message: 'Successfully connected with admin privileges',
        details: 'Admin client can access protected resources'
      })
      results.summary.passed++
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    if (message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      results.tests.push({
        name: 'Admin Client Connection',
        status: 'warning',
        message: 'Service role key not configured',
        details: 'Optional for basic app functionality. Add SUPABASE_SERVICE_ROLE_KEY to .env.local for admin features'
      })
      results.summary.warnings++
    } else {
      results.tests.push({
        name: 'Admin Client Connection',
        status: 'failed',
        message,
        details: 'Failed to create or test admin client'
      })
      results.summary.failed++
    }
  }

  // Test 3: Environment Variables
  const envVars = {
    required: {
      'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    optional: {
      'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
    }
  }

  const envTest: TestResult = {
    name: 'Environment Variables',
    status: 'passed',
    message: 'All required environment variables are set',
    variables: {}
  }

  for (const [key, value] of Object.entries(envVars.required)) {
    if (value) {
      envTest.variables![key] = `${value.substring(0, 20)}...`
    } else {
      envTest.variables![key] = 'Not set'
      envTest.status = 'failed'
      envTest.message = 'Some required environment variables are missing'
    }
  }

  for (const [key, value] of Object.entries(envVars.optional)) {
    if (value) {
      envTest.variables![key] = `${value.substring(0, 20)}... (optional)`
    } else {
      envTest.variables![key] = 'Not set (optional)'
    }
  }

  results.tests.push(envTest)
  if (envTest.status === 'passed') {
    results.summary.passed++
  } else {
    results.summary.failed++
  }

  return NextResponse.json(results, { 
    status: results.summary.failed > 0 ? 500 : 200 
  })
}
