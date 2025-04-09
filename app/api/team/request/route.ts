import { createTeamJoinRequest } from '@queries/server/teamJoinRequest'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { teamId, userId } = await request.json()

    if (!teamId || !userId) {
      return NextResponse.json({ error: 'Team ID and User ID are required' }, { status: 400 })
    }

    const joinRequest = await createTeamJoinRequest({ userId, teamId })
    
    return NextResponse.json({ success: true, request: joinRequest })
  } catch (error) {
    console.error('Error creating team join request:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create team join request' 
    }, { status: 500 })
  }
}
