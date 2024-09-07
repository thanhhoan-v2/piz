"use client"
import { Button } from "@components/atoms/button"
import { Input } from "@components/atoms/input"
import { X } from "lucide-react"
import React, { type ChangeEvent } from "react"

export default function InputUserName() {
	const [userName, setUserName] = React.useState("")

	const handleUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
		setUserName(event.target.value)
	}

	const clearUserName = () => setUserName("")

	return (
		<>
			<div className="flex gap-1">
				<Input
					id="user_name"
					name="user_name"
					type="user_name"
					value={userName}
					onChange={handleUserNameChange}
					placeholder=""
					required
				/>

				{userName.length > 0 && (
					<Button variant="ghost" onClick={clearUserName}>
						<X className="size-4" />
					</Button>
				)}
			</div>
		</>
	)
}
