import UserProfile from "@components/ui/profile/UserProfile"
import { stackServerApp } from "../../../stack"

type Params = Promise<{ userName: string }>

export default async function UserPage(props: { params: Params }) {
	const { userName } = await props.params
	const user = await stackServerApp.getUser(userName)

	const serializedUser = {
		id: user?.id ?? "",
		userName: user?.displayName ?? "",
		avatarUrl: user?.profileImageUrl ?? "",
	}

	return <UserProfile initialUser={serializedUser} />
}
