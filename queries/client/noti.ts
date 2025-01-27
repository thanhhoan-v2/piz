"use client"
import { getAllNotifications } from "@queries/server/noti"
import { useQuery } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"

export const useQueryNotifications = (userId?: string) => {
	return useQuery({
		queryKey: queryKey.noti.all,
		queryFn: async () => {
			if (!userId) return []
			return getAllNotifications({ receiverId: userId })
		},
		enabled: !!userId,
		refetchInterval: 3000,
		refetchIntervalInBackground: true,
		// select: (data) => {
		// 	return data.map((notification) => ({
		// 		...notification,
		// 		formattedMessage: getNotificationMessage(notification),
		// 	}))
		// },
	})
}
