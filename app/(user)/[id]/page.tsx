import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@components/atoms/avatar"
import { AvatarStack } from "@components/atoms/avatar-stack"
import { Button } from "@components/atoms/button"
import { firstLetterToUpper } from "@utils/string.helpers"
import { createSupabaseClientWithCookies } from "@utils/supabase/server"

export default async function UserPage({
	params,
}: { params: { id: string } }) {
	const supabase = createSupabaseClientWithCookies()
	const {
		data: { user },
	} = await supabase.auth.getUser()
	const avatars = [
		{ name: "a", image: "https://github.com/shadcn.png" },
		{ name: "a", image: "https://github.com/shadcn.png" },
		{ name: "a", image: "https://github.com/shadcn.png" },
		{ name: "a", image: "https://github.com/shadcn.png" },
	]

	return (
		<>
			<div>
				<div className="mt-5 flex-between px-4">
					<div className="text-start">
						<h1 className="text-3xl text-bold">
							{firstLetterToUpper(user?.user_metadata?.full_name)}
						</h1>
						<h2 className="text-gray-400">@{params.id}</h2>
					</div>

					<div className="">
						<Avatar className="h-24 w-24">
							<AvatarImage src="https://github.com/shadcn.png" />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
					</div>
				</div>

				<div className="mt-5 flex-start-center gap-5 px-4">
					<AvatarStack
						avatars={avatars}
						showHiddenAvatarLength={false}
					/>
					<p>18 followers</p>
				</div>

				<Button variant="outline" className="mt-5 w-full">
					Edit profile
				</Button>
			</div>
		</>
	)
}
