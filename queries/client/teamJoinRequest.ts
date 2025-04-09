"use client"

import { 
  createTeamJoinRequest, 
  getTeamJoinRequests, 
  acceptTeamJoinRequest, 
  rejectTeamJoinRequest 
} from "@queries/server/teamJoinRequest"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"
import { toast } from "sonner"

// Hook to create a team join request
export const useCreateTeamJoinRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, teamId }: { userId: string; teamId: string }) => {
      return createTeamJoinRequest({ userId, teamId })
    },
    onSuccess: () => {
      toast.success("Join request sent successfully")
      queryClient.invalidateQueries({ queryKey: queryKey.teamJoinRequests.all })
    },
    onError: (error) => {
      toast.error(`Failed to send join request: ${error.message}`)
    },
  })
}

// Hook to get all pending join requests for a team
export const useTeamJoinRequests = (teamId?: string) => {
  return useQuery({
    queryKey: queryKey.teamJoinRequests.byTeam(teamId || ""),
    queryFn: async () => {
      if (!teamId) return []
      return getTeamJoinRequests(teamId)
    },
    enabled: !!teamId,
  })
}

// Hook to accept a join request
export const useAcceptTeamJoinRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (requestId: string) => {
      return acceptTeamJoinRequest(requestId)
    },
    onSuccess: () => {
      toast.success("Join request accepted")
      queryClient.invalidateQueries({ queryKey: queryKey.teamJoinRequests.all })
    },
    onError: (error) => {
      toast.error(`Failed to accept join request: ${error.message}`)
    },
  })
}

// Hook to reject a join request
export const useRejectTeamJoinRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (requestId: string) => {
      return rejectTeamJoinRequest(requestId)
    },
    onSuccess: () => {
      toast.success("Join request rejected")
      queryClient.invalidateQueries({ queryKey: queryKey.teamJoinRequests.all })
    },
    onError: (error) => {
      toast.error(`Failed to reject join request: ${error.message}`)
    },
  })
}
