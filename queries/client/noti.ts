import { getAllNotifications } from "@queries/server/noti"
import { useQuery } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"

export const useQueryAllNotifications = ({
	// Id of the user who receives the notifications
	receiverId,
}: { receiverId?: string }) =>
	useQuery({
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		queryKey: queryKey.noti.selectId(receiverId!),
		queryFn: async () => getAllNotifications({ receiverId: receiverId }),
		enabled: !!receiverId,
	})
