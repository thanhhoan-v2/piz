import UserProfile from "@components/ui/profile/UserProfile"
import { stackServerApp } from "../../../stack"

type Params = Awaited<{ params: { userName: string } }>

export default async function UserPage({ params }: Params) {
	const user = await stackServerApp.getUser(params.userName)

	// Serialize the user object by picking only the needed properties
	const serializedUser = {
		id: user?.id ?? "",
		userName: user?.displayName ?? "",
		avatarUrl: user?.profileImageUrl ?? "",
	}

	return <UserProfile initialUser={serializedUser} />
}
