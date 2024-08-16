import Post from "@components/molecules/post"
import { ROUTE } from "@constants/route"
import { Prisma } from "@prisma/functions/client"
import { createSupabaseClientWithCookies } from "@utils/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
	const supabase = createSupabaseClientWithCookies()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		return redirect(ROUTE.SIGN_IN)
	}

	const posts = await Prisma.post.findMany()

	return (
		<>
			<div className="grid gap-6">
				{posts.map(
					({
						id,
						userId,
						userName,
						userAvatarUrl,
						content,
						noShares,
						visibility,
						createdAt,
						updatedAt,
						isDeleted,
					}) => (
						<Post
							key={id}
							id={id}
							userId={userId}
							userName={userName}
							userAvatarUrl={userAvatarUrl}
							content={content}
							noShares={noShares}
							visibility={visibility}
							createdAt={createdAt}
							updatedAt={updatedAt}
							isDeleted={isDeleted}
						/>
					),
				)}
			</div>
		</>
	)
}
