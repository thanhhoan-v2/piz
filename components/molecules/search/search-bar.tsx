"use client"
import { userAtom } from "@atoms/user"
import { Input } from "@components/atoms/input"
import SearchList from "@components/molecules/search/search-list"
import SearchSkeleton from "@components/molecules/skeleton/search-skeleton"
import { useDebounce } from "@hooks/use-debounce"
import type { AppUser } from "@prisma/client"
import { supabasePartialSearch } from "@supabase/functions/partial-search"
import { searchUsersByUserNamePrefix } from "@supabase/prefix-functions"
import { useAtomValue } from "jotai"
import { SearchIcon } from "lucide-react"
import React from "react"

export default function SearchBar() {
	const [searchValue, setSearchValue] = React.useState<string>("")
	const [searchResults, setSearchResults] = React.useState<AppUser[]>([])
	const [isSearching, setIsSearching] = React.useState<boolean>(false)

	const user = useAtomValue(userAtom)
	const appUserId = user?.id

	const handleSearch = React.useCallback(
		useDebounce(async (value: string) => {
			try {
				setIsSearching(true)
				// Partial search using Supabase API
				const data = await supabasePartialSearch({
					// user input value
					prefix: value,
					// prefix function created on Supabase
					prefixFunction: searchUsersByUserNamePrefix,
				})
				setSearchResults(data)
				setIsSearching(false)
			} catch (error) {
				console.error("Error searching: ", error)
			}
		}, 500), // Debounce time in milliseconds
		[],
	)

	React.useEffect(() => {
		if (searchValue) {
			handleSearch(searchValue)
		} else {
			setSearchResults([])
		}
	}, [searchValue, handleSearch])

	return (
		<>
			<div className="mobile_l:w-[400px] mobile_m:w-[350px] mobile_s:w-[300px] tablet:w-[600px] flex-center flex-col">
				<div className="relative w-full">
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
				{isSearching ? (
					<>
						<SearchSkeleton />
						<SearchSkeleton />
						<SearchSkeleton />
					</>
				) : (
					<SearchList
						searchResults={searchResults}
						appUserId={appUserId ?? null}
					/>
				)}
			</div>
		</>
	)
}
