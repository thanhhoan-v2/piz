"use client"
import { Input } from "@components/atoms/input"
import type { AppUserProps } from "@prisma/global"
import { supabasePartialSearch } from "@supabase/functions/partial-search"
import { SearchIcon } from "lucide-react"
import React from "react"

export default function SearchBar() {
	const [searchValue, setSearchValue] = React.useState<string>("")
	const [searchResults, setSearchResults] = React.useState<AppUserProps[]>([])

	React.useEffect(() => {
		const handleSearch = async () => {
			try {
				// Partial search using Supabase API
				const res = await supabasePartialSearch({
					// user input value
					prefix: searchValue,
					// prefix function created on Supabase
					prefixFunction: "search_users_by_username_prefix",
				})
				setSearchResults(res)
			} catch (error) {
				console.error("Error fetching data:", error)
			}
		}

		// Avoid calling handleSearch() when searchValue is empty
		// which can return all records !
		if (searchValue) {
			handleSearch()
		}
	}, [searchValue])

	console.log(searchResults)

	return (
		<>
			<div className="relative w-full max-w-sm">
				<SearchIcon className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
				<Input
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
					type="search"
					placeholder="Search..."
					className="pl-8"
				/>
			</div>

			{/* Display search results */}
			{searchResults?.map((user) => (
				<div key={user.id}>{user.userName}</div>
			))}
		</>
	)
}
