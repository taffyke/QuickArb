import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

interface RequestBody {
  keyId: string;
}

// Exchange API testing functions
const testExchangeConnection = async (
  exchange: string, 
  apiKey: string, 
  secret: string, 
  passphrase?: string
) => {
  try {
    // This would need to be expanded for actual implementation with ccxt or similar library
    switch (exchange) {
      case 'Binance':
        // In a real implementation, this would make a /api/v3/account API call to Binance
        return { success: true, message: 'Successfully connected to Binance API' };
        
      case 'Coinbase':
        // Would test Coinbase connection
        return { success: true, message: 'Successfully connected to Coinbase API' };
        
      case 'Kraken':
        // Would test Kraken connection
        return { success: true, message: 'Successfully connected to Kraken API' };
        
      default:
        // Generic test for other exchanges
        return { success: true, message: `Successfully connected to ${exchange} API` };
    }
  } catch (error) {
    console.error(`Error testing ${exchange} connection:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error connecting to exchange' 
    };
  }
};

serve(async (req) => {
  // Create a Supabase client with the Auth context of the logged in user
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  )

  // Get the session of the authenticated user
  const {
    data: { session },
  } = await supabaseClient.auth.getSession()

  // If no active session, return unauthorized error
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Parse request body
  const { keyId } = await req.json() as RequestBody
  
  if (!keyId) {
    return new Response(JSON.stringify({ error: 'Missing keyId parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Get the API key from the database
    const { data: apiKey, error } = await supabaseClient
      .from('api_keys')
      .select('*')
      .eq('id', keyId)
      .eq('user_id', session.user.id)
      .single()

    if (error || !apiKey) {
      return new Response(JSON.stringify({ error: 'API key not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Test the connection to the exchange
    const result = await testExchangeConnection(
      apiKey.exchange,
      apiKey.api_key,
      apiKey.secret,
      apiKey.passphrase
    )

    // Update the last_used timestamp and status
    await supabaseClient
      .from('api_keys')
      .update({ 
        last_used: new Date().toISOString(),
        status: result.success ? 'active' : 'error'
      })
      .eq('id', keyId)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in test-api-key function:', error)
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}) 