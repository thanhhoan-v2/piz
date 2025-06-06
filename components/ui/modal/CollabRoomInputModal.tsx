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
	const [isHovered, setIsHovered] = useState(false)

	return (
		<>
			<style jsx>{`
				@keyframes float {
					0% { transform: translateY(0px); }
					50% { transform: translateY(-10px); }
					100% { transform: translateY(0px); }
				}
				.float-animation {
					animation: float 3s ease-in-out infinite;
				}
			`}</style>
			<Dialog open={isModalOpen} onOpenChange={toggleModalOpen}>
				<DialogTrigger className="cursor-pointer" asChild>
					{children}
				</DialogTrigger>
				<DialogContent className="rounded-xl w-[90vw] max-w-md min-h-[300px] p-6 border-2 border-border/50 shadow-lg backdrop-blur-sm bg-background/95">
					<DialogHeader className="space-y-4">
						<div className="flex-center">
							<div className="relative float-animation">
								<div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl rounded-full" />
								<span className="relative text-4xl">🚀</span>
							</div>
						</div>
						<DialogTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
							Join Collaboration Room
						</DialogTitle>
					</DialogHeader>
					<div className="mt-6 space-y-6">
						<DialogDescription className="text-center text-muted-foreground">
							Enter the room code to start collaborating with your team
						</DialogDescription>
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 blur-md -z-10" />
							<Input
								type="number"
								placeholder="Enter room code..."
								className="text-center text-lg py-6 border-2 transition-all duration-300 focus:scale-[1.02]"
								onChange={(e) => setRoomNumber(Number(e.target.value))}
							/>
						</div>
					</div>
					<div className="flex-center mt-8">
						<Button
							asChild
							className={`
								relative w-full max-w-[200px] py-6 overflow-hidden
								bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90
								transition-all duration-300 transform
								${isHovered ? "scale-105" : ""}
							`}
							onClick={() => toggleModalOpen(false)}
							onMouseEnter={() => setIsHovered(true)}
							onMouseLeave={() => setIsHovered(false)}
						>
							<Link href={`/collab/${roomNumber}`} className="text-lg font-medium">
								Let's Collaborate
							</Link>
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
