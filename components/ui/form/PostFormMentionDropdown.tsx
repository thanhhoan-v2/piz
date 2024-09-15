"use client"

import {
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@components/ui/Command"
import { Input } from "@components/ui/Input"
import { Command } from "lucide-react"
import { useEffect, useRef, useState } from "react"

// Mock user data
const users = [
	{ id: 1, name: "Alice Johnson", username: "alice_j" },
	{ id: 2, name: "Bob Smith", username: "bob_smith" },
	{ id: 3, name: "Charlie Brown", username: "charlie_b" },
	{ id: 4, name: "Diana Prince", username: "wonder_woman" },
	{ id: 5, name: "Ethan Hunt", username: "mission_possible" },
]

export default function PostFormMentionDropdown() {
	const [inputValue, setInputValue] = useState("")
	const [showDropdown, setShowDropdown] = useState(false)
	const [filteredUsers, setFilteredUsers] = useState(users)
	const [mentionIndex, setMentionIndex] = useState(-1)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (showDropdown) {
			const mentionText = inputValue.slice(mentionIndex + 1)
			setFilteredUsers(
				users.filter(
					(user) =>
						user.name.toLowerCase().includes(mentionText.toLowerCase()) ||
						user.username.toLowerCase().includes(mentionText.toLowerCase()),
				),
			)
		}
	}, [inputValue, showDropdown, mentionIndex])

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		setInputValue(newValue)

		const lastAtIndex = newValue.lastIndexOf("@")
		if (lastAtIndex !== -1 && lastAtIndex === newValue.length - 1) {
			setShowDropdown(true)
			setMentionIndex(lastAtIndex)
		} else if (lastAtIndex === -1 || lastAtIndex < mentionIndex) {
			setShowDropdown(false)
		}
	}

	const handleSelectUser = (user: (typeof users)[0]) => {
		const beforeMention = inputValue.slice(0, mentionIndex)
		const afterMention = inputValue.slice(mentionIndex + 1)
		setInputValue(`${beforeMention}@${user.username} ${afterMention}`)
		setShowDropdown(false)
		inputRef.current?.focus()
	}

	return (
		<div className="mx-auto w-full max-w-md space-y-4">
			<Input
				ref={inputRef}
				type="text"
				placeholder="Type @ to mention a user"
				value={inputValue}
				onChange={handleInputChange}
				className="w-full"
			/>

			{showDropdown && (
				<Command className="rounded-lg border shadow-md">
					<CommandInput placeholder="Search users..." />
					<CommandList>
						<CommandEmpty>No users found.</CommandEmpty>
						<CommandGroup heading="Suggestions">
							{filteredUsers.map((user) => (
								<CommandItem
									key={user.id}
									onSelect={() => handleSelectUser(user)}
									className="cursor-pointer"
								>
									<div className="flex items-center">
										<div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
											{user.name[0]}
										</div>
										<div>
											<p className="font-medium">{user.name}</p>
											<p className="text-muted-foreground text-sm">
												@{user.username}
											</p>
										</div>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			)}
		</div>
	)
}
