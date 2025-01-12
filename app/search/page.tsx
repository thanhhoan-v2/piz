"use server"
import SearchBar from "@components/ui/search/SearchBar"

export default async function SearchPage() {
	return (
		<>
			<div className="mt-[100px] flex-col w-[70%]">
				<SearchBar />
			</div>
		</>
	)
}
