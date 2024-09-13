import SearchBar from "@components/ui/search/SearchBar"
import SearchList from "@components/ui/search/SearchList"
import { useSupabaseServer } from "@hooks/supabase/server"
import { getRandomUserList } from "@queries/server/user"

export default async function SearchPage() {
	const supabase = useSupabaseServer()
	const { data: user } = await supabase.auth.getUser()
	const userId = user?.user?.id
	const randomUserList = await getRandomUserList(userId, 1)

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
