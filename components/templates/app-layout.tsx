"use client"
import HeaderBar from "@components/organisms/header-bar"
import SideBar from "@components/organisms/side-bar"
import { cn } from "@utils/cn"
import React from "react"
import { useEffect } from "react"

const AppLayout = ({ children }: { children: React.ReactNode }) => {
	const [isVisible, setIsVisible] = React.useState(true)
	const [lastScrollY, setLastScrollY] = React.useState(0)

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY

			if (currentScrollY > lastScrollY) {
				setIsVisible(false)
			} else {
				setIsVisible(true)
			}

			setLastScrollY(currentScrollY)
		}

		window.addEventListener("scroll", handleScroll, { passive: true })

		return () => window.removeEventListener("scroll", handleScroll)
	}, [lastScrollY])

	const headerBarIsVisible = isVisible ? "transform-y-0" : "-translate-y-full"
	const sideBarIsVisible = isVisible ? "transform-y-0" : "translate-y-full"

	return (
		<>
			<div className="flex w-full flex-col pt-[70px] text-foreground transition-colors duration-300">
				<HeaderBar
					className={cn(
						"fixed top-0 right-0 left-0 z-50 flex-between bg-background px-3 py-2 shadow-md transition-transform duration-300 ease-in-out",
						headerBarIsVisible,
					)}
				/>

				<div>
					<SideBar
						mobileSideBarClassName={cn(
							"fixed shadow-md transition-transform duration-300 ease-in-out",
							sideBarIsVisible,
						)}
					/>
					<main className="mobile_s:mx-1 ml-[100px] mobile_s:ml-0 h-auto mobile_s:w-full flex-center">
						{children}
					</main>
				</div>
			</div>
		</>
	)
}

export { AppLayout }
