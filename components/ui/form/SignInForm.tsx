"use client"

import { userAtom } from "@atoms/user"
import { Button } from "@components/ui/Button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@components/ui/Card"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import AuthButton from "@components/ui/button/AuthButton"
import { ROUTE } from "@constants/route"
import { useSignIn } from "@hooks/auth/useSignIn"
import type { AppUser } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"
import { useSetAtom } from "jotai"
import { X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"

const translateErrorMessage = (
	errorMessage: string,
	foundUser: AppUser | null,
) => {
	const errorMessageMap: { [key: string]: string } = {
		"Invalid login credentials": "Wrong email or password",
	}
	const foundUserErrorMessageMap: { [key: string]: string } = {
		"Invalid login credentials":
			"The password that you've entered is incorrect",
	}

	if (foundUser) {
		return foundUserErrorMessageMap[errorMessage] ?? errorMessage
	}

	return errorMessageMap[errorMessage] ?? errorMessage
}

export default function SignInForm() {
	const [email, setEmail] = React.useState<string>("")
	const [password, setPassword] = React.useState<string>("")
	const [loading, setLoading] = React.useState<boolean>(false)
	const [error, setError] = React.useState<string | null>(null)

	const router = useRouter()
	const queryClient = useQueryClient()
	const setUserAtom = useSetAtom(userAtom)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		const { user, session, errorMessage, foundUser } = await useSignIn({
			email,
			password,
		})

		if (errorMessage) {
			const translatedErrorMessage = translateErrorMessage(
				errorMessage,
				foundUser,
			)
			setError(translatedErrorMessage)
		} else if (user) {
			queryClient.setQueryData(queryKey.user.selectMain(), user)

			setUserAtom(user)

			setLoading(false)

			router.push(ROUTE.HOME)
		}
	}

	return (
		<>
			<Card className="w-full max-w-sm border-none">
				<CardHeader>
					<CardTitle className="text-2xl">Sign In</CardTitle>
					<CardDescription>
						Enter your email below to login to your account.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="grid gap-4" onSubmit={handleSubmit}>
						<div className="grid gap-2">
							{/* email */}
							<Label htmlFor="email">Email</Label>
							<div className="flex">
								<Input
									id="email"
									name="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder=""
									required
								/>

								{email.length > 0 && (
									<Button variant="ghost" onClick={() => setEmail("")}>
										<X className="size-4" />
									</Button>
								)}
							</div>
						</div>
						<div className="grid gap-2">
							<div className="flex-between">
								{/* password */}
								<Label htmlFor="password">Password</Label>
								<Link
									href="/forgot-password"
									className="text-sm decoration-pink-400 underline-offset-4 hover:underline hover:decoration-wavy"
								>
									Forgot your password?
								</Link>
							</div>
							<div className="flex gap-1">
								<Input
									id="password"
									name="password"
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder=""
									required
								/>

								{password.length > 0 && (
									<Button variant="ghost" onClick={() => setPassword("")}>
										<X className="size-4" />
									</Button>
								)}
							</div>
						</div>
						<div className="grid gap-2">
							<AuthButton
								isLoading={loading}
								normalLabel="Sign In"
								loadingLabel="Signing In"
							/>
						</div>
						<div className="mt-4 flex-between text-sm">
							Don&apos;t have an account?{" "}
							<Link
								href="/sign-up"
								className="text-md decoration-pink-400 underline-offset-4 hover:underline hover:decoration-wavy"
							>
								Sign up
							</Link>
						</div>
					</form>
				</CardContent>
				<CardFooter>
					{error && (
						<div className="w-full p-4 text-center text-foreground">
							<div className="flex-center gap-2 text-red-700">
								<p>{error}</p>
							</div>
						</div>
					)}
				</CardFooter>
			</Card>
		</>
	)
}
