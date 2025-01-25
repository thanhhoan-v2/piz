"use server"
import SearchBar from "@components/ui/search/SearchBar"

export default async function SearchPage() {
	return (
		<>
			<div className="mt-[100px] w-[70%] flex-col">
				<SearchBar />
			</div>
		</>
	)
}
