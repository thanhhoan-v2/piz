"use client"

import { useQuery } from "@tanstack/react-query"
import { getUserFollowers, getUserFollowing } from "@queries/server/follow"

export interface FollowerUser {
  id: string
  userName: string
  avatarUrl?: string | null
}

export function useQueryUserFollowers(userId: string) {
  return useQuery<FollowerUser[]>({
    queryKey: ["user", userId, "followers"],
    queryFn: () => getUserFollowers(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  })
}

export function useQueryFollowersCount(userId: string) {
  const followersQuery = useQueryUserFollowers(userId)
  
  // Return the count if available, otherwise 0
  return {
    ...followersQuery,
    count: followersQuery.data?.length || 0
  }
}

export function useQueryUserFollowing(userId: string) {
  return useQuery<FollowerUser[]>({  // Reusing FollowerUser interface since structure is identical
    queryKey: ["user", userId, "following"],
    queryFn: () => getUserFollowing(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
  })
}

export function useQueryFollowingCount(userId: string) {
  const followingQuery = useQueryUserFollowing(userId)
  
  // Return the count if available, otherwise 0
  return {
    ...followingQuery,
    count: followingQuery.data?.length || 0
  }
}
