import { ROUTE } from "@constants/route"
import Link from "next/link"
import React from "react"
import { Button } from "../Button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../Dialog"

export default function WelcomeModal({ children }: { children: React.ReactNode }) {
	const [isWelcomeModalOpen, toggleWelcomeModal] = React.useState(false)

	return (
		<>
			<Dialog open={isWelcomeModalOpen} onOpenChange={toggleWelcomeModal}>
				<DialogTrigger className="cursor-pointer" asChild>
					{children}
				</DialogTrigger>
				<DialogContent className="min-h-[300px] w-[80vw] rounded-lg">
					<DialogHeader className="mt-8">
						<DialogTitle className="font-bold tablet:text-3xl">
							<span className="text-md underline decoration-pink-400 decoration-wavy underline-offset-4">
								Getting started&nbsp;
							</span>
							with Piz
						</DialogTitle>
					</DialogHeader>
					<DialogDescription className="text-center tablet:text-lg">
						Join&nbsp;
						<span className="font-bold text-pink-400">Piz</span> to share thoughts, find out what's
						going on, follow your people and more.
					</DialogDescription>
					<div className="flex-center ">
						<Button asChild className="max-w-[200px]" onClick={() => toggleWelcomeModal(false)}>
							<Link href={ROUTE.SIGN_IN}>Explore</Link>
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
