"use client"
import { searchUsers } from "@/app/actions/search"
import { Input } from "@components/ui/Input"
import SearchList from "@components/ui/search/SearchList"
import { Loader2, Search, X } from "lucide-react"
import React from "react"

interface SearchResultFromAPI {
	id: string
	userName: string | null
	userAvatarUrl: string | null
	email: string
}

interface SearchResultProps {
	id: string
	userName: string
	avatarUrl?: string | null
}

export default function SearchBar() {
	const [searchValue, setSearchValue] = React.useState("")
	const [searchResults, setSearchResults] = React.useState<SearchResultFromAPI[]>([])
	const [isSearching, setIsSearching] = React.useState(false)

	const [debouncedSearchValue, setDebouncedSearchValue] = React.useState(searchValue)

	// Debounce the search value
	React.useEffect(() => {
		const timeoutId = setTimeout(() => {
			setDebouncedSearchValue(searchValue)
		}, 300)

		return () => {
			clearTimeout(timeoutId)
		}
	}, [searchValue])

	// Minimum characters required for search
	const MIN_SEARCH_LENGTH = 2

	// Perform the search when the debounced value changes
	React.useEffect(() => {
		const performSearch = async () => {
			const trimmedSearch = debouncedSearchValue.trim()
			if (!trimmedSearch) {
				setSearchResults([])
				return
			}

			// Only search if the query is at least MIN_SEARCH_LENGTH characters
			if (trimmedSearch.length < MIN_SEARCH_LENGTH) {
				setSearchResults([])
				return
			}

			setIsSearching(true)
			try {
				const results = await searchUsers(debouncedSearchValue)

				// Additional client-side filtering to ensure results contain the search term
				const filteredResults = results.filter((result) => {
					const userName = (result.userName || "").toLowerCase()
					const email = (result.email || "").toLowerCase()
					const searchTerm = debouncedSearchValue.toLowerCase()

					return userName.includes(searchTerm) || email.includes(searchTerm)
				})

				setSearchResults(filteredResults)
			} catch (error) {
				console.error("Search error:", error)
				setSearchResults([])
			} finally {
				setIsSearching(false)
			}
		}

		performSearch()
	}, [debouncedSearchValue])

	const handleKeyPress = React.useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				// Immediately update the debounced value to trigger a search
				setDebouncedSearchValue(searchValue)
			}
		},
		[searchValue]
	)

	const [isFocused, setIsFocused] = React.useState(false)

	return (
		<>
			<div className="flex-col gap-4 search-container">
				<div className="relative flex gap-2">
					<div className="group relative flex-1">
						<div className="top-1/2 left-3 z-20 absolute -translate-y-1/2 transform">
							<Search
								size={18}
								className={`
									pointer-events-none
									transition-all duration-300
									${isFocused ? "text-primary icon-pop" : searchValue ? "text-primary/80" : "text-muted-foreground"}
									group-hover:text-primary/90
									group-hover:scale-110
									transform-gpu
								`}
							/>
						</div>
						<div className="relative w-full">
							<Input
								placeholder="Type to search"
								value={searchValue}
								onChange={(e) => {
									setSearchValue(e.target.value)
								}}
								onFocus={() => setIsFocused(true)}
								onBlur={() => setIsFocused(false)}
								onKeyUp={handleKeyPress}
								className="z-10 relative py-5 pr-10 pl-10 border-2 focus:border-primary group-hover:border-primary/50 rounded-lg w-full placeholder:text-muted-foreground/70 text-base focus:scale-[1.01] transition-all duration-300"
							/>
							{searchValue && (
								<div className="top-1/2 right-3 z-20 absolute -translate-y-1/2 transform">
									{isSearching ? (
										<Loader2 size={18} className="text-muted-foreground animate-spin" />
									) : (
										<X
											size={18}
											className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
											onClick={() => setSearchValue("")}
										/>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
				{searchValue.trim() && (
					<div className="mt-2 search-results">
						{searchValue.trim().length < MIN_SEARCH_LENGTH ? (
							<div className="p-4 text-muted-foreground text-center">
								Please enter at least {MIN_SEARCH_LENGTH} characters to search
							</div>
						) : isSearching ? (
							<div className="p-4 text-muted-foreground text-center">
								<Loader2 className="inline-block mr-2 animate-spin" size={16} />
								Searching...
							</div>
						) : searchResults.length > 0 ? (
							<SearchList
								searchResults={searchResults.map(
									(result): SearchResultProps => ({
										id: result.id,
										userName: result.userName || "Unknown User",
										avatarUrl: result.userAvatarUrl,
									})
								)}
							/>
						) : (
							<div className="p-4 text-muted-foreground text-center">No results found</div>
						)}
					</div>
				)}
			</div>
		</>
	)
}
