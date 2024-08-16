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
import { SubmitButton } from "@components/molecules/button/submit-button"
import { signUp } from "@services/auth/sign-up"
import { TriangleAlert } from "lucide-react"
import Link from "next/link"

export default function SignUpPage({
	searchParams,
}: { searchParams: { type: string; message: string } }) {
	return (
		<Card className="w-full max-w-sm border-none">
			<CardHeader>
				<CardTitle className="text-2xl">Sign Up</CardTitle>
				<CardDescription>
					Create a new Piz account to get started.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="grid gap-4">
					{/* full name */}
					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="first_name">First name</Label>
							<Input
								id="first_name"
								type="first_name"
								name="first_name"
								placeholder=""
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="last_name">Last name</Label>
							<Input
								id="last_name"
								type="last_name"
								name="last_name"
								placeholder=""
								required
							/>
						</div>
					</div>
					{/* username */}
					<div className="grid gap-2">
						<Label htmlFor="user_name">Username</Label>
						<Input
							id="user_name"
							type="user_name"
							name="user_name"
							placeholder=""
							required
						/>
					</div>
					{/* email */}
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder=""
							required
						/>
					</div>
					{/* password */}
					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							required
						/>
					</div>
					<div className="grid gap-2">
						<SubmitButton
							formAction={signUp}
							pendingText="Creating your account"
							placeholder="Create an account"
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
				{/* message */}
				{searchParams?.message && (
					<div className="mt-4 w-full p-4 text-center text-foreground">
						<div className="flex-center gap-2 text-red-700">
							<TriangleAlert size={18} />
							{searchParams.message}
						</div>
					</div>
				)}
			</CardFooter>
		</Card>
	)
}
