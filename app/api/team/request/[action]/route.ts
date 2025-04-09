import { acceptTeamJoinRequest, rejectTeamJoinRequest } from '@queries/server/teamJoinRequest'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { action: string } }
) {
  try {
    const { requestId } = await request.json()
    const { action } = params

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }

    if (action === 'accept') {
      const result = await acceptTeamJoinRequest(requestId)
      return NextResponse.json({ success: true, request: result })
    } else if (action === 'reject') {
      const result = await rejectTeamJoinRequest(requestId)
      return NextResponse.json({ success: true, request: result })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error(`Error ${params.action}ing team join request:`, error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : `Failed to ${params.action} team join request` 
    }, { status: 500 })
  }
}
