"use server"

import { prisma } from "@prisma/createClient"
import { createNotification } from "@queries/server/noti"
import { stackServerApp } from "@/stack"

// Create a new team join request
export async function createTeamJoinRequest({
  userId,
  teamId,
}: {
  userId: string
  teamId: string
}) {
  try {
    console.log(`[TEAM_JOIN_REQUEST] Creating request: ${userId} -> ${teamId}`)
    
    // Check if the team exists and is public
    const team = await stackServerApp.getTeam(teamId)
    if (!team) {
      console.error(`[TEAM_JOIN_REQUEST] Team ${teamId} not found`)
      throw new Error("Team not found")
    }
    
    if (team.clientMetadata?.isPublic !== true) {
      console.error(`[TEAM_JOIN_REQUEST] Team ${teamId} is not public`)
      throw new Error("Team is not public")
    }
    
    // Check if the user exists
    const user = await stackServerApp.getUser(userId)
    if (!user) {
      console.error(`[TEAM_JOIN_REQUEST] User ${userId} not found`)
      throw new Error("User not found")
    }
    
    // Check if the user is already a member of the team
    const teamUsers = await team.listUsers()
    const isAlreadyMember = teamUsers.some(teamUser => teamUser.id === userId)
    if (isAlreadyMember) {
      console.error(`[TEAM_JOIN_REQUEST] User ${userId} is already a member of team ${teamId}`)
      throw new Error("User is already a member of this team")
    }
    
    // Check if there's already a pending request
    const existingRequest = await prisma.teamJoinRequest.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    })
    
    if (existingRequest && existingRequest.status === "pending") {
      console.log(`[TEAM_JOIN_REQUEST] Request already exists: ${existingRequest.id}`)
      return existingRequest
    }
    
    // Create the join request
    const joinRequest = await prisma.teamJoinRequest.create({
      data: {
        userId,
        teamId,
        status: "pending",
      },
    })
    
    console.log(`[TEAM_JOIN_REQUEST] Created: ${joinRequest.id}`)
    
    // Get team members with update permission to notify them
    const teamMembersWithPermission = teamUsers.filter(teamUser => {
      const hasPermission = user.hasPermission(team, "$update_team")
      return hasPermission
    })
    
    // Create notifications for team members with permission
    await Promise.all(
      teamMembersWithPermission.map(async (teamMember) => {
        try {
          await createNotification({
            receiverId: teamMember.id,
            senderId: userId,
            type: "TEAM_JOIN_REQUEST",
          })
        } catch (error) {
          console.error(`[TEAM_JOIN_REQUEST] Error creating notification for ${teamMember.id}:`, error)
        }
      })
    )
    
    return joinRequest
  } catch (error) {
    console.error("[TEAM_JOIN_REQUEST] Error creating request:", error)
    throw error
  }
}

// Get all pending join requests for a team
export async function getTeamJoinRequests(teamId: string) {
  try {
    const requests = await prisma.teamJoinRequest.findMany({
      where: {
        teamId,
        status: "pending",
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    
    return requests
  } catch (error) {
    console.error(`[TEAM_JOIN_REQUEST] Error getting requests for team ${teamId}:`, error)
    return []
  }
}

// Accept a join request
export async function acceptTeamJoinRequest(requestId: string) {
  try {
    // Get the request
    const request = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
    })
    
    if (!request) {
      throw new Error("Join request not found")
    }
    
    if (request.status !== "pending") {
      throw new Error(`Request is already ${request.status}`)
    }
    
    // Get the team and user
    const team = await stackServerApp.getTeam(request.teamId)
    const user = await stackServerApp.getUser(request.userId)
    
    if (!team || !user) {
      throw new Error("Team or user not found")
    }
    
    // Add the user to the team
    await team.addUser(user)
    
    // Update the request status
    const updatedRequest = await prisma.teamJoinRequest.update({
      where: { id: requestId },
      data: {
        status: "accepted",
        updatedAt: new Date(),
      },
    })
    
    return updatedRequest
  } catch (error) {
    console.error(`[TEAM_JOIN_REQUEST] Error accepting request ${requestId}:`, error)
    throw error
  }
}

// Reject a join request
export async function rejectTeamJoinRequest(requestId: string) {
  try {
    // Get the request
    const request = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
    })
    
    if (!request) {
      throw new Error("Join request not found")
    }
    
    if (request.status !== "pending") {
      throw new Error(`Request is already ${request.status}`)
    }
    
    // Update the request status
    const updatedRequest = await prisma.teamJoinRequest.update({
      where: { id: requestId },
      data: {
        status: "rejected",
        updatedAt: new Date(),
      },
    })
    
    return updatedRequest
  } catch (error) {
    console.error(`[TEAM_JOIN_REQUEST] Error rejecting request ${requestId}:`, error)
    throw error
  }
}
