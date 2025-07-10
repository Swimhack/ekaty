import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health check without database for now
    // const supabase = createServerClient()
    
    // Test database connection
    // const { data, error } = await supabase
    //   .from('restaurants')
    //   .select('count')
    //   .limit(1)
    //   .single()

    // if (error) {
    //   throw error
    // }

    // Check if environment variables are set
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'RESEND_API_KEY'
    ]

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: 'skipped',
        environment: 'configured'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: {
          database: 'failed',
          environment: 'unknown'
        }
      },
      { status: 503 }
    )
  }
}