"use client"

import { HeaderBarCustomTheme } from "@components/layout/headerBar/HeaderBarCustomTheme"
import { Logo } from "@components/ui/Logo"
import HeaderDropdownMenu from "./HeaderBarDropdownMenu"
import HeaderBarLogo from "./HeaderBarLogo"
import HeaderBarNavigation from "./HeaderBarNavigation"

/**
 * A header bar component that displays a logo, navigation links, a custom theme toggle, and a dropdown menu.
 *
 * @prop {string} className - The class name for the header element.
 *
 * @returns A JSX element representing the header bar.
 */
export default function HeaderBar({ className }: { className: string }) {
	return (
		<>
			<header className={className}>
				{/* lefty - desktop view */}
				<div className="desktop-only gap-4">
					<Logo />
				</div>

				{/* lefty - mobile view */}
				<HeaderBarNavigation />

				{/* center */}
				<HeaderBarLogo />

				{/* righty */}
				<div className="ml-auto flex items-center gap-4">
					<HeaderBarCustomTheme />
					<HeaderDropdownMenu />
				</div>
			</header>
		</>
	)
}
