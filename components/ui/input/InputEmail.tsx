"use client"
import { Button } from "@components/ui/Button"
import { Input } from "@components/ui/Input"
import { X } from "lucide-react"
import React, { type ChangeEvent } from "react"

export default function InputEmail() {
	const [email, setEmail] = React.useState("")

	const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
		setEmail(event.target.value)
	}

	const clearEmail = () => setEmail("")

	return (
		<>
			<div className="flex gap-1">
				<Input
					id="email"
					name="email"
					type="email"
					value={email}
					onChange={handleEmailChange}
					placeholder=""
					required
				/>

				{email.length > 0 && (
					<Button variant="ghost" onClick={clearEmail}>
						<X className="size-4" />
					</Button>
				)}
			</div>
		</>
	)
}
