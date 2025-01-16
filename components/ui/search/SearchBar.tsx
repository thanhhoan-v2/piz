"use client"
import { searchUsers } from "@/app/actions/search"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import SearchList from "@components/ui/search/SearchList"
import { useUser } from "@stackframe/stack"
import { cn } from "@utils/cn"
import { Search } from "lucide-react"
import React from "react"

interface SearchBarProps {
	className?: string
	placeholder?: string
}

export default function SearchBar({
	className,
	placeholder = "Type here to search"
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
		if (e.key === 'Enter') {
			handleSearch()
		}
	}

	React.useEffect(() => {
		const timeoutId = setTimeout(handleSearch, 300)

		return () => {
			console.log("[SearchBar] Clearing timeout")
			clearTimeout(timeoutId)
		}
	}, [searchValue]) // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="flex-col gap-4">
			<div className={cn("relative flex gap-2", className)}>
				<div className="relative flex-1">
					<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
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
				<SearchList
					searchResults={searchResults}
					appUserId={user?.id}
				/>
			)}
		</div>
	)
}
