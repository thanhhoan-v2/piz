"use client"
import { Input } from "@components/ui/Input"
import { Separator } from "@components/ui/Separator"
import SearchList, {
	type SearchResultProps,
} from "@components/ui/search/SearchList"
import SearchSkeleton from "@components/ui/skeleton/SearchResultSkeleton"
import { useQueryAppUser } from "@queries/client/appUser"
import { usePartialSearch } from "@queries/server/supabase/supabasePartialSearch"
import { SearchIcon, Sparkles } from "lucide-react"
import React from "react"

export default function SearchBar() {
	const [searchValue, setSearchValue] = React.useState<string>("")
	const [isSearching, setIsSearching] = React.useState<boolean>(false)
	const [searchResults, setSearchResults] = React.useState<SearchResultProps>(
		[],
	)

	const { data: user } = useQueryAppUser()
	const appUserId = user?.id

	const handleSearchvalue = async (value: string) => {
		try {
			if (value.length > 0) {
				setIsSearching(true)
				const data = await usePartialSearch({
					prefix: value,
				})
				setIsSearching(false)
				setSearchResults(data)
			}
		} catch (error) {
			console.error("Error searching: ", error)
		}
	}

	console.log(isSearching)

	// biome-ignore lint/correctness/useExhaustiveDependencies: handleSearchvalue renders on every change
	React.useEffect(() => {
		if (searchValue.length > 0) {
			handleSearchvalue(searchValue.toLowerCase())
		} else {
			setSearchResults([])
		}
	}, [searchValue])

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
				{isSearching && (
					<>
						<SearchSkeleton />
						<SearchSkeleton />
						<SearchSkeleton />
					</>
				)}

				{searchValue.length > 0 && (
					<>
						<div className="w-full">
							<SearchList
								searchResults={searchResults}
								appUserId={appUserId ?? null}
							/>
							<div className="my-1 flex-center gap-3">
								<Separator className="w-1/3" />
								<Sparkles color="#272727" size={15} />
								<Separator className="w-1/3" />
							</div>
						</div>
					</>
				)}
			</div>
		</>
	)
}
