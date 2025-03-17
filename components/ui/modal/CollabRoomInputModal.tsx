import Link from "next/link"
import type React from "react"
import { useState } from "react"
import { Button } from "../Button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../Dialog"
import { Input } from "../Input"

export default function CollabRoomInputModal({ children }: { children: React.ReactNode }) {
	const [isModalOpen, toggleModalOpen] = useState(false)
	const [roomNumber, setRoomNumber] = useState<number>()

	return (
		<>
			<Dialog open={isModalOpen} onOpenChange={toggleModalOpen}>
				<DialogTrigger className="cursor-pointer" asChild>
					{children}
				</DialogTrigger>
				<DialogContent className="rounded-lg w-[80vw] min-h-[300px]">
					<DialogHeader className="mt-8">
						<DialogTitle className="font-bold tablet:text-3xl">Enter your room's code</DialogTitle>
					</DialogHeader>
					<DialogDescription className="tablet:text-lg text-center">
						<Input type="number" onChange={(e) => setRoomNumber(Number(e.target.value))} />
					</DialogDescription>
					<div className="flex-center">
						<Button asChild className="max-w-[200px]" onClick={() => toggleModalOpen(false)}>
							<Link href={`/collab/${roomNumber}`}>Enter</Link>
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
