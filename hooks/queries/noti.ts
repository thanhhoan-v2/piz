import { NOTI } from "@constants/query-key"
import { getAllNotifications } from "@prisma/functions/noti"
import { useQuery } from "@tanstack/react-query"

export const useQueryAllNotifications = ({
	receiverId,
}: { receiverId?: string | null }) =>
	useQuery({
		queryKey: [NOTI.ALL, receiverId],
		queryFn: async () => getAllNotifications({ receiverId: receiverId }),
		retry: 3,
		enabled: !!receiverId,
	})
