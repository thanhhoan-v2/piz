"use server"
import SearchBar from "@components/ui/search/SearchBar"

export default async function SearchPage() {
	// const { data: user } = await supabase.auth.getUser()
	// const userId = user?.user?.id
	// const randomUserList = await getRandomUserList(userId, 10)

	return (
		<>
			<div className="mt-[100px] flex-col">
				<SearchBar />
				{/* {randomUserList && user && ( */}
				{/* 	<SearchList */}
				{/* 		searchResults={randomUserList} */}
				{/* 		appUserId={user?.user?.id} */}
				{/* 	/> */}
				{/* )} */}
			</div>
		</>
	)
}
