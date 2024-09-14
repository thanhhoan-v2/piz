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
import { faker } from "@faker-js/faker"
import { useSignUp } from "@hooks/auth/useSignUp"
import { useQueryClient } from "@tanstack/react-query"
import { queryKey } from "@utils/queryKeyFactory"
import { useSetAtom } from "jotai"
import { TriangleAlert, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "nextjs-toploader/app"
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
	const setUserAtom = useSetAtom(userAtom)

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setLoading(true)
		setError(null)

		const { user, error } = await useSignUp({
			email,
			password,
			firstName,
			lastName,
			userName,
		})

		if (error) {
			setError(error.message)
		} else if (user) {
			queryClient.setQueryData(queryKey.user.selectMain(), user)
			setUserAtom(user)
			router.push(ROUTE.HOME)
		}
		setLoading(false)
	}

	const handleFakeUser = () => {
		const fake_email: string = faker.internet.email()
		const fake_firstName: string = faker.person.firstName()
		const fake_lastName: string = faker.person.lastName()
		const fake_userName: string = faker.internet.userName()
		const fake_password: string = "aaaaaa"

		setEmail(fake_email)
		setPassword(fake_password)
		setFirstName(fake_firstName)
		setLastName(fake_lastName)
		setUserName(fake_userName)
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
								<div className="flex">
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
							</div>
							<div className="grid gap-2">
								{/* last name */}
								<Label htmlFor="lastName">Last name</Label>
								<div className="flex">
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
						</div>
						{/* username */}
						<div className="grid gap-2">
							<Label htmlFor="userName">Username</Label>
							<div className="flex">
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
						</div>
						{/* email */}
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<div className="flex">
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
						</div>
						{/* password */}
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>

							<div className="flex">
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
					<Button onClick={handleFakeUser}>Fake user</Button>
				</CardFooter>
			</Card>
		</>
	)
}
