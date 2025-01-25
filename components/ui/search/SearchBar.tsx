"use client"
import { searchUsers } from "@/app/actions/search"
import { Input } from "@components/ui/Input"
import SearchList from "@components/ui/search/SearchList"
import { useUser } from "@stackframe/stack"
import { Search } from "lucide-react"
import React from "react"

interface SearchBarProps {
	className?: string
	placeholder?: string
}

export default function SearchBar({
	placeholder = "Type here to search",
}: SearchBarProps) {
	const [searchValue, setSearchValue] = React.useState("")
	const [isSearching, setIsSearching] = React.useState(false)
	const [searchResults, setSearchResults] = React.useState<any[]>([])
	const user = useUser()

	const handleSearch = async () => {
		if (searchValue.length > 0) {
			setIsSearching(true)
			try {
				const results = await searchUsers(searchValue)
				setSearchResults(results)
			} catch (error) {
				setSearchResults([])
			} finally {
				setIsSearching(false)
			}
		}
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch()
		}
	}

	React.useEffect(() => {
		const timeoutId = setTimeout(handleSearch, 300)

		return () => {
			console.log("[SearchBar] Clearing timeout")
			clearTimeout(timeoutId)
		}
	}, [searchValue])

	return (
		<div className="flex-col gap-4">
			<div className="relative flex gap-2">
				<div className="relative flex-1">
					<Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder={placeholder}
						value={searchValue}
						onChange={(e) => {
							console.log("[SearchBar] Input changed:", e.target.value)
							setSearchValue(e.target.value)
						}}
						onKeyUp={handleKeyPress}
						className="pl-8"
					/>
				</div>
			</div>
			{searchResults.length > 0 && (
				<SearchList searchResults={searchResults} appUserId={user?.id} />
			)}
		</div>
	)
}
