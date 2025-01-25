"use server"
import UserProfile from "@components/ui/profile/UserProfile"
import { stackServerApp } from "../../../stack"

export default async function UserPage({
	params,
}: { params: { userName: string } }) {
	const user = await stackServerApp.getUser(params.userName)

	// Serialize the user object by picking only the needed properties
	const serializedUser = {
		id: user?.id ?? "",
		userName: user?.displayName ?? "",
		avatarUrl: user?.profileImageUrl ?? "",
	}

	return <UserProfile initialUser={serializedUser} />
}
