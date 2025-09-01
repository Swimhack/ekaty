import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  id: string
  user_id: string
  username: string
  avatar_url?: string
  message: string
  timestamp: string
  likes: number
  parent_id?: string
  is_edited: boolean
  is_deleted: boolean
}

interface User {
  id: string
  username: string
  avatar_url?: string
  is_online: boolean
  last_seen: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { method } = req
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    switch (method) {
      case 'GET':
        if (path === 'messages') {
          return await getMessages(supabase, url)
        } else if (path === 'users') {
          return await getOnlineUsers(supabase)
        } else if (path === 'health') {
          return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break

      case 'POST':
        if (path === 'messages') {
          return await createMessage(supabase, req)
        } else if (path === 'like') {
          return await likeMessage(supabase, req)
        } else if (path === 'users/heartbeat') {
          return await updateUserHeartbeat(supabase, req)
        }
        break

      case 'PUT':
        if (path === 'messages') {
          return await updateMessage(supabase, req)
        }
        break

      case 'DELETE':
        if (path === 'messages') {
          return await deleteMessage(supabase, req)
        }
        break
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in community chat function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function getMessages(supabase: any, url: URL) {
  const parentId = url.searchParams.get('parent_id')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const offset = parseInt(url.searchParams.get('offset') || '0')

  let query = supabase
    .from('community_messages')
    .select(`
      *,
      user:user_id(username, avatar_url),
      replies:community_messages(*, user:user_id(username, avatar_url))
    `)
    .eq('is_deleted', false)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1)

  if (parentId) {
    query = query.eq('parent_id', parentId)
  } else {
    query = query.is('parent_id', null)
  }

  const { data, error } = await query

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ messages: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function createMessage(supabase: any, req: Request) {
  const { user_id, username, message, parent_id, avatar_url } = await req.json()

  if (!user_id || !username || !message) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const { data, error } = await supabase
    .from('community_messages')
    .insert({
      user_id,
      username,
      message: message.trim(),
      parent_id: parent_id || null,
      avatar_url,
      timestamp: new Date().toISOString(),
      likes: 0,
      is_edited: false,
      is_deleted: false
    })
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ message: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function updateMessage(supabase: any, req: Request) {
  const { id, message, user_id } = await req.json()

  if (!id || !message || !user_id) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Verify user owns the message
  const { data: existingMessage, error: fetchError } = await supabase
    .from('community_messages')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchError || existingMessage.user_id !== user_id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const { data, error } = await supabase
    .from('community_messages')
    .update({
      message: message.trim(),
      is_edited: true,
      edited_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ message: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function deleteMessage(supabase: any, req: Request) {
  const { id, user_id } = await req.json()

  if (!id || !user_id) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Verify user owns the message
  const { data: existingMessage, error: fetchError } = await supabase
    .from('community_messages')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchError || existingMessage.user_id !== user_id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const { error } = await supabase
    .from('community_messages')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function likeMessage(supabase: any, req: Request) {
  const { message_id, user_id } = await req.json()

  if (!message_id || !user_id) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Check if user already liked the message
  const { data: existingLike, error: fetchError } = await supabase
    .from('message_likes')
    .select('*')
    .eq('message_id', message_id)
    .eq('user_id', user_id)
    .single()

  if (existingLike) {
    // Unlike the message
    const { error: unlikeError } = await supabase
      .from('message_likes')
      .delete()
      .eq('message_id', message_id)
      .eq('user_id', user_id)

    if (unlikeError) {
      return new Response(JSON.stringify({ error: unlikeError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Decrease like count
    const { error: updateError } = await supabase.rpc('decrease_message_likes', { message_id })
    
    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ liked: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } else {
    // Like the message
    const { error: likeError } = await supabase
      .from('message_likes')
      .insert({
        message_id,
        user_id,
        timestamp: new Date().toISOString()
      })

    if (likeError) {
      return new Response(JSON.stringify({ error: likeError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Increase like count
    const { error: updateError } = await supabase.rpc('increase_message_likes', { message_id })
    
    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ liked: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function getOnlineUsers(supabase: any) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('online_users')
    .select('*')
    .gte('last_seen', fiveMinutesAgo)
    .order('last_seen', { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ users: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function updateUserHeartbeat(supabase: any, req: Request) {
  const { user_id, username, avatar_url } = await req.json()

  if (!user_id || !username) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const { error } = await supabase
    .from('online_users')
    .upsert({
      user_id,
      username,
      avatar_url,
      last_seen: new Date().toISOString(),
      is_online: true
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}


