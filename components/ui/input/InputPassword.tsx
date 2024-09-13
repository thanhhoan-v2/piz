"use client"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { X } from "lucide-react"
import React, { type ChangeEvent } from "react"

export default function InputPassword() {
	const [password, setPassword] = React.useState("")

	const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value)
	}

	const clearPassword = () => setPassword("")

	return (
		<>
			<div className="flex gap-1">
				<Input
					id="password"
					name="password"
					type="password"
					value={password}
					onChange={handlePasswordChange}
					placeholder=""
					required
				/>

				{password.length > 0 && (
					<Button variant="ghost" onClick={clearPassword}>
						<X className="size-4" />
					</Button>
				)}
			</div>
		</>
	)
}
