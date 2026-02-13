import { Suspense } from 'react'

// Helper function to map test status to border and background colors
function getStatusColors(status: 'passed' | 'failed' | 'warning') {
  const colors = {
    passed: { border: '#0a0', background: '#efe' },
    failed: { border: '#c00', background: '#fee' },
    warning: { border: '#fa0', background: '#ffc' }
  }
  return colors[status]
}

async function getTestResults() {
  try {
    // Use relative URL to work in all environments
    const res = await fetch('/api/test-connection', {
      cache: 'no-store'
    })
    return await res.json()
  } catch (error) {
    return null
  }
}

export default async function TestConnectionPage() {
  const results = await getTestResults()

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '50px auto', 
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>🔍 Supabase Connection Test</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Tests both regular client and admin client connections
      </p>

      {!results ? (
        <div style={{ 
          padding: '20px', 
          background: '#fee', 
          borderRadius: '8px',
          border: '1px solid #fcc'
        }}>
          <p style={{ margin: 0, color: '#c00' }}>
            ❌ Failed to load test results
          </p>
        </div>
      ) : (
        <>
          <div style={{ 
            padding: '15px', 
            background: '#f5f5f5', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div><strong>Timestamp:</strong> {new Date(results.timestamp).toLocaleString()}</div>
            <div style={{ marginTop: '10px' }}>
              <strong>Summary:</strong> {' '}
              <span style={{ color: '#0a0' }}>✓ {results.summary.passed} passed</span>, {' '}
              <span style={{ color: '#c60' }}>⚠ {results.summary.warnings} warnings</span>, {' '}
              <span style={{ color: '#c00' }}>✗ {results.summary.failed} failed</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {results.tests.map((test: any, idx: number) => {
              const colors = getStatusColors(test.status)
              return (
              <div 
                key={idx}
                style={{ 
                  padding: '20px',
                  border: '2px solid',
                  borderColor: colors.border,
                  borderRadius: '8px',
                  background: colors.background
                }}
              >
                <h3 style={{ 
                  margin: '0 0 10px 0',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>{test.status === 'passed' ? '✓' : test.status === 'warning' ? '⚠' : '✗'}</span>
                  {test.name}
                </h3>
                
                {test.message && (
                  <p style={{ margin: '0 0 10px 0' }}>
                    <strong>Message:</strong> {test.message}
                  </p>
                )}
                
                {test.details && (
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>
                    {test.details}
                  </p>
                )}

                {test.variables && (
                  <div style={{ marginTop: '10px', fontSize: '14px' }}>
                    <strong>Environment Variables:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {Object.entries(test.variables).map(([key, value]) => (
                        <li key={key}>
                          <code style={{ 
                            background: 'rgba(0,0,0,0.1)', 
                            padding: '2px 6px', 
                            borderRadius: '3px',
                            fontSize: '12px'
                          }}>
                            {key}
                          </code>: {value as string}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              )
            })}
          </div>

          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            background: '#f0f8ff', 
            borderRadius: '8px',
            border: '1px solid #4a90e2'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>💡 About This Test</h3>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>This page tests your Supabase connection configuration</li>
              <li>Regular client uses anonymous key for public access</li>
              <li>Admin client uses service role key for elevated permissions</li>
              <li>You can refresh this page to re-run the tests</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
