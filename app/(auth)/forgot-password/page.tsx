import { Button } from "@components/ui/Button"
import { Card, CardContent, CardHeader } from "@components/ui/Card"
import { Input } from "@components/ui/Input"
import { Label } from "@components/ui/Label"
import Link from "next/link"

export default function ForgotPasswordPage() {
	return (
		<>
			<Card className="w-full max-w-sm border-none">
				<CardHeader>
					<h2 className="mt-6 text-center font-bold text-3xl text-gray-900 tracking-tight dark:text-gray-50">
						Forgot your password?
					</h2>
					<p className="mt-2 text-center text-gray-600 text-sm dark:text-gray-400">
						Enter the email address associated with your account and we'll send
						you a link to reset your password.
					</p>
				</CardHeader>
				<CardContent>
					<form className="space-y-6" action="#" method="POST">
						<div>
							<Label htmlFor="email" className="sr-only">
								Email address
							</Label>
							<Input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								placeholder="Email address"
							/>
						</div>
						<Button type="submit" className="w-full">
							Reset password
						</Button>
					</form>
				</CardContent>

				<div className="flex justify-center">
					<Link
						href="/sign-in"
						className="text-md decoration-pink-400 underline-offset-4 hover:underline hover:decoration-wavy"
					>
						Back to login
					</Link>
				</div>
			</Card>
		</>
	)
}
