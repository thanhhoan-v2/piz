// This file enables webhook support for Supabase real-time
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Extract the webhook payload
    const payload = await req.json()
    console.log('Received Supabase webhook event:', payload)
    
    // Broadcast this to all connected clients
    // This is essential for real-time chat to work properly
    await supabase.realtime.broadcast({ 
      event: payload.type, 
      data: payload 
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}
