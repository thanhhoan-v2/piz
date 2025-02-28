import UserProfile from "@components/ui/profile/UserProfile"
import { stackServerApp } from "../../../stack"

export default async function UserPage({ params }: { params: Promise<{ userId: string }> }) {
	const { userId } = await params
	const user = await stackServerApp.getUser(userId)

	const serializedUser = {
		id: user?.id ?? "",
		userName: user?.displayName ?? "",
		avatarUrl: user?.profileImageUrl ?? "",
	}

	return <UserProfile initialUser={serializedUser} />
}
