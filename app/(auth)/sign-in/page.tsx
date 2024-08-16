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
import { signIn } from "@services/auth/sign-in"
import { TriangleAlert } from "lucide-react"
import Link from "next/link"

export default function SignInPage({
	searchParams,
}: {
	searchParams: { type: string; message: string }
}) {
	return (
		<Card className="w-full max-w-sm border-none">
			<CardHeader>
				<CardTitle className="text-2xl">Sign In</CardTitle>
				<CardDescription>
					Enter your email below to login to your account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="grid gap-4">
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
					<div className="grid gap-2">
						<div className="flex-between">
							<Label htmlFor="password">Password</Label>
							<Link
								href="/forgot-password"
								className="text-md decoration-pink-400 underline-offset-4 hover:underline hover:decoration-wavy"
							>
								Forgot your password?
							</Link>
						</div>
						<Input
							id="password"
							name="password"
							type="password"
							required
						/>
					</div>
					<div className="grid gap-2">
						<SubmitButton
							formAction={signIn}
							pendingText="Signing in"
							placeholder="Sign in"
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
				{/* message */}
				{searchParams?.message && (
					<div className="w-full p-4 text-center text-foreground">
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
