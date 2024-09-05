import SearchBar from "@components/molecules/search/search-bar"
import SearchList from "@components/molecules/search/search-list"
import { getRandomUserList } from "@prisma/functions/user"
import { createSupabaseClientWithCookies } from "@utils/supabase/server"

export default async function SearchPage() {
	const supabase = createSupabaseClientWithCookies()
	const { data: user } = await supabase.auth.getUser()
	const userId = user?.user?.id
	const randomUserList = await getRandomUserList(userId, 8)

	return (
		<>
			<div className="flex-col">
				<SearchBar />
				{randomUserList && user && (
					<SearchList
						searchResults={randomUserList}
						appUserId={user?.user?.id}
					/>
				)}
			</div>
		</>
	)
}
