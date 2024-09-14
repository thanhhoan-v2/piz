import { getAllNotifications, getNotification } from "@queries/server/noti"
import { useQuery } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"

export const useQueryNotification = ({
	notificationId,
}: { notificationId?: number | null }) =>
	useQuery({
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		queryKey: queryKey.noti.selectId(notificationId!),
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		queryFn: async () => getNotification({ notificationId: notificationId! }),
		enabled: !!notificationId,
	})

export const useQueryAllNotifications = ({
	// Id of the user who receives the notifications
	userId,
}: { userId?: string }) =>
	useQuery({
		queryKey: queryKey.noti.all,
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		queryFn: async () => getAllNotifications({ receiverId: userId! }),
		enabled: !!userId,
	})
