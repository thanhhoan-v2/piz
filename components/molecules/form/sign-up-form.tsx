"use client"

import { Button } from "@components/atoms/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@components/atoms/card"
import { Input } from "@components/atoms/input"
import { Label } from "@components/atoms/label"
import AuthButton from "@components/molecules/button/auth-button"
import { USER } from "@constants/query-key"
import { ROUTE } from "@constants/route"
import { useSignUp } from "@hooks/auth/use-sign-up"
import { useQueryClient } from "@tanstack/react-query"
import { TriangleAlert, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"

export default function SignUpForm() {
	const [firstName, setFirstName] = React.useState<string>("")
	const [lastName, setLastName] = React.useState<string>("")
	const [userName, setUserName] = React.useState<string>("")
	const [email, setEmail] = React.useState<string>("")
	const [password, setPassword] = React.useState<string>("")
	const [loading, setLoading] = React.useState<boolean>(false)
	const [error, setError] = React.useState<string | null>(null)

	const router = useRouter()
	const queryClient = useQueryClient()

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		const { user, session, error } = await useSignUp({
			email,
			password,
			firstName,
			lastName,
			userName,
		})

		if (error) {
			setError(error.message)
		} else {
			// Store in query client
			queryClient.setQueryData([USER.APP], user)
			queryClient.setQueryData([USER.SESSION], session)
			// Store in local storage
			// localStorage.setItem(USER.APP, JSON.stringify(session))
			// localStorage.setItem(USER.SESSION, JSON.stringify(session))

			router.push(ROUTE.HOME)
		}

		setLoading(false)
	}

	return (
		<>
			<Card className="h-screen w-full max-w-sm flex-col justify-center border-none">
				<CardHeader>
					<CardTitle className="text-2xl">Sign Up</CardTitle>
					<CardDescription>
						Create a new Piz account to get started.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="grid gap-4" onSubmit={handleSubmit}>
						{/* full name */}
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								{/* first name */}
								<Label htmlFor="firstName">First name</Label>
								<Input
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									id="firstName"
									type="firstName"
									name="firstName"
									placeholder=""
									required
								/>
								{firstName.length > 0 && (
									<Button variant="ghost" onClick={() => setPassword("")}>
										<X className="size-4" />
									</Button>
								)}
							</div>
							<div className="grid gap-2">
								{/* last name */}
								<Label htmlFor="lastName">Last name</Label>
								<Input
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									id="lastName"
									type="lastName"
									name="lastName"
									placeholder=""
									required
								/>
								{lastName.length > 0 && (
									<Button variant="ghost" onClick={() => setPassword("")}>
										<X className="size-4" />
									</Button>
								)}
							</div>
						</div>
						{/* username */}
						<div className="grid gap-2">
							<Label htmlFor="userName">Username</Label>
							<Input
								value={userName}
								onChange={(e) => setUserName(e.target.value)}
								id="userName"
								type="userName"
								name="userName"
								placeholder=""
								required
							/>
							{userName.length > 0 && (
								<Button variant="ghost" onClick={() => setPassword("")}>
									<X className="size-4" />
								</Button>
							)}
						</div>
						{/* email */}
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								id="email"
								name="email"
								type="email"
								placeholder=""
								required
							/>
							{email.length > 0 && (
								<Button variant="ghost" onClick={() => setPassword("")}>
									<X className="size-4" />
								</Button>
							)}
						</div>
						{/* password */}
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								id="password"
								name="password"
								type="password"
								required
							/>
							{password.length > 0 && (
								<Button variant="ghost" onClick={() => setPassword("")}>
									<X className="size-4" />
								</Button>
							)}
						</div>
						<div className="grid gap-2">
							<AuthButton
								isLoading={loading}
								normalLabel="Sign Up"
								loadingLabel="Signing Up"
							/>
						</div>
						<div className="flex-between text-sm">
							Already had an account?{" "}
							<Link
								href="/sign-in"
								className="text-md decoration-pink-400 underline-offset-4 hover:underline hover:decoration-wavy"
							>
								Sign in
							</Link>
						</div>
					</form>
				</CardContent>
				<CardFooter>
					{error && (
						<div className="w-full p-4 text-center text-foreground">
							<div className="flex-center gap-2 text-red-700">
								<TriangleAlert size={18} />
								<p>{error}</p>
							</div>
						</div>
					)}
				</CardFooter>
			</Card>
		</>
	)
}
