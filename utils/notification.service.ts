"use server"

import { prisma } from "@prisma/createClient"
import { createNotification } from "@queries/server/noti"

// Define a type assertion function to handle notification types
function assertNotificationType(type: string): any {
  return type as any
}

/**
 * Create a follow notification when a user follows another user
 */
export async function createFollowNotification(followerId: string, followeeId: string) {
  return createNotification({
    senderId: followerId,
    receiverId: followeeId,
    type: "FOLLOW",
  })
}

/**
 * Create a post notification when a user creates a new post
 * This will notify all followers of the user
 */
export async function createPostNotification(userId: string, postId: string) {
  try {
    // Get all followers of the user
    const followers = await prisma.follow.findMany({
      where: { followeeId: userId },
      select: { followerId: true },
    })

    // Create a notification for each follower
    const notifications = await Promise.all(
      followers.map((follower) =>
        createNotification({
          senderId: userId,
          receiverId: follower.followerId,
          type: "POST",
          options: {
            postId,
          },
        })
      )
    )

    return notifications.filter(Boolean)
  } catch (error) {
    console.error("Error creating post notifications:", error)
    return []
  }
}

/**
 * Create a comment notification when a user comments on a post
 * This will notify the post owner
 */
export async function createCommentNotification(
  commenterId: string,
  postId: string,
  commentId: string
) {
  try {
    // Get the post owner
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    })

    if (!post) return null

    // Create a notification for the post owner
    return createNotification({
      senderId: commenterId,
      receiverId: post.userId,
      type: "COMMENT",
      options: {
        postId,
        commentId,
      },
    })
  } catch (error) {
    console.error("Error creating comment notification:", error)
    return null
  }
}

/**
 * Create a reaction notification when a user reacts to a post
 */
export async function createPostReactionNotification(
  reactorId: string,
  postId: string
) {
  try {
    // Get the post owner
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    })

    if (!post) return null

    // Create a notification for the post owner
    return createNotification({
      senderId: reactorId,
      receiverId: post.userId,
      type: "POST_REACTION",
      options: {
        postId,
      },
    })
  } catch (error) {
    console.error("Error creating post reaction notification:", error)
    return null
  }
}

/**
 * Create a reaction notification when a user reacts to a comment
 */
export async function createCommentReactionNotification(
  reactorId: string,
  commentId: string
) {
  try {
    // Get the comment owner and post
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, postId: true },
    })

    if (!comment) return null

    // Create a notification for the comment owner
    return createNotification({
      senderId: reactorId,
      receiverId: comment.userId,
      type: "COMMENT_REACTION",
      options: {
        postId: comment.postId,
        commentId,
      },
    })
  } catch (error) {
    console.error("Error creating comment reaction notification:", error)
    return null
  }
}

/**
 * Create a team join request notification
 * This will notify all team admins
 */
export async function createTeamJoinRequestNotification(
  requesterId: string,
  teamId: string
) {
  try {
    // For now, we'll assume all team members are admins
    // In a real app, you'd filter for admin roles
    // Since we don't have a direct TeamMember model, we'll use a raw query
    const teamMembers = await prisma.$queryRaw`
      SELECT "userId" FROM "TeamMember" WHERE "teamId" = ${teamId}
    ` as Array<{ userId: string }>

    // Create a notification for each team admin
    const notifications = await Promise.all(
      teamMembers.map((member) =>
        createNotification({
          senderId: requesterId,
          receiverId: member.userId,
          type: "TEAM_JOIN_REQUEST",
          options: {
            teamId,
          },
        })
      )
    )

    return notifications.filter(Boolean)
  } catch (error) {
    console.error("Error creating team join request notification:", error)
    return []
  }
}

/**
 * Create a team joined notification
 * This will notify all team members
 */
export async function createTeamJoinedNotification(
  joinerId: string,
  teamId: string
) {
  try {
    // Get all team members except the joiner
    // Since we don't have a direct TeamMember model, we'll use a raw query
    const teamMembers = await prisma.$queryRaw`
      SELECT "userId" FROM "TeamMember"
      WHERE "teamId" = ${teamId} AND "userId" != ${joinerId}
    ` as Array<{ userId: string }>

    // Create a notification for each team member
    const notifications = await Promise.all(
      teamMembers.map((member) =>
        createNotification({
          senderId: joinerId,
          receiverId: member.userId,
          type: assertNotificationType("TEAM_JOINED"),
          options: {
            teamId,
          },
        })
      )
    )

    return notifications.filter(Boolean)
  } catch (error) {
    console.error("Error creating team joined notification:", error)
    return []
  }
}

/**
 * Create a collab room joined notification
 * This will notify all room members who follow the joiner
 */
export async function createCollabRoomJoinedNotification(
  joinerId: string,
  roomId: string
) {
  try {
    // Get all room members except the joiner
    // Since we don't have a direct CollabMember model, we'll use a raw query
    const roomMembers = await prisma.$queryRaw`
      SELECT "userId" FROM "CollabMember"
      WHERE "roomId" = ${roomId} AND "userId" != ${joinerId}
    ` as Array<{ userId: string }>

    // Get all followers of the joiner
    const followers = await prisma.follow.findMany({
      where: {
        followeeId: joinerId,
        followerId: { in: roomMembers.map((m: { userId: string }) => m.userId) }
      },
      select: { followerId: true },
    })

    // Create a notification for each follower who is in the room
    const notifications = await Promise.all(
      followers.map((follower) =>
        createNotification({
          senderId: joinerId,
          receiverId: follower.followerId,
          type: assertNotificationType("COLLAB_ROOM_JOINED"),
          options: {
            roomId,
          },
        })
      )
    )

    return notifications.filter(Boolean)
  } catch (error) {
    console.error("Error creating collab room joined notification:", error)
    return []
  }
}

/**
 * Create a collab room invitation notification
 */
export async function createCollabRoomInvitationNotification(
  inviterId: string,
  inviteeId: string,
  roomId: string
) {
  return createNotification({
    senderId: inviterId,
    receiverId: inviteeId,
    type: assertNotificationType("COLLAB_ROOM_INVITED"),
    options: {
      roomId,
    },
  })
}
