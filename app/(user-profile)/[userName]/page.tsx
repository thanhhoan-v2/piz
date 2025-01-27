import UserProfile from "@components/ui/profile/UserProfile"
import { stackServerApp } from "../../../stack"

export default async function UserPage({
	params,
}: { params: Promise<{ userName: string }> }) {
	const { userName } = await params
	const user = await stackServerApp.getUser(userName)

	const serializedUser = {
		id: user?.id ?? "",
		userName: user?.displayName ?? "",
		avatarUrl: user?.profileImageUrl ?? "",
	}

	return <UserProfile initialUser={serializedUser} />
}
