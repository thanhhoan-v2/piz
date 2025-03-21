"use client"
import { searchUsers } from "@/app/actions/search"
import { Input } from "@components/ui/Input"
import SearchList from "@components/ui/search/SearchList"
import { Search } from "lucide-react"
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

	const handleSearch = React.useCallback(async () => {
		if (!searchValue.trim()) {
			setSearchResults([])
			return
		}
		setIsSearching(true)
		try {
			const results = await searchUsers(searchValue)
			setSearchResults(results)
		} catch (error) {
			setSearchResults([])
		} finally {
			setIsSearching(false)
		}
	}, [searchValue])

	const handleKeyPress = React.useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				handleSearch()
			}
		},
		[handleSearch],
	)

	React.useEffect(() => {
		const timeoutId = setTimeout(handleSearch, 300)

		return () => {
			console.log("[SearchBar] Clearing timeout")
			clearTimeout(timeoutId)
		}
	}, [handleSearch])

	const [isFocused, setIsFocused] = React.useState(false)

	return (
		<>
			<style jsx>{`
				@keyframes fadeIn {
					from { opacity: 0; transform: translateY(-10px); }
					to { opacity: 1; transform: translateY(0); }
				}
				@keyframes iconPop {
					0% { transform: scale(1) translateX(0); }
					50% { transform: scale(1.2) translateX(-2px); }
					100% { transform: scale(1) translateX(0); }
				}
				.search-container {
					animation: fadeIn 0.3s ease-out;
				}
				.search-results {
					animation: fadeIn 0.2s ease-out;
				}
				.icon-pop {
					animation: iconPop 0.3s ease-out;
				}
			`}</style>
			<div className="flex-col gap-4 search-container">
				<div className="relative flex gap-2">
					<div className="relative flex-1 group">
						<div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg blur-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
						<Search
							className={`
								absolute top-3 left-3 h-4 w-4
								pointer-events-none
								transition-all duration-300
								${isFocused ? "text-primary icon-pop" : searchValue ? "text-primary/80" : "text-muted-foreground"}
								group-hover:text-primary/90
								group-hover:scale-110
								transform-gpu
							`}
						/>
						<Input
							placeholder="Type to search"
							value={searchValue}
							onChange={(e) => {
								console.log("[SearchBar] Input changed:", e.target.value)
								setSearchValue(e.target.value)
							}}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
							onKeyUp={handleKeyPress}
							className="
								relative z-10
								pl-10 pr-4 py-5 text-base
								border-2 rounded-lg
								transition-all duration-300
								group-hover:border-primary/50
								focus:scale-[1.01] focus:border-primary
								placeholder:text-muted-foreground/70
							"
						/>
					</div>
				</div>
				{searchValue.trim() && searchResults.length > 0 && (
					<div className="search-results mt-2">
						<SearchList
							searchResults={searchResults.map(
								(result): SearchResultProps => ({
									id: result.id,
									userName: result.userName || "Unknown User",
									avatarUrl: result.userAvatarUrl,
								}),
							)}
						/>
					</div>
				)}
			</div>
		</>
	)
}
